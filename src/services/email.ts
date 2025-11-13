import axios from "axios";
import type { Participant } from "../types";
import { supabase } from "../lib/supabase";

const EMAIL_API_URL = "https://api.erp.rainhadassete.com/api/Email/enviar";

/**
 * Envia um email para um participante usando a API externa
 */
export const sendEmail = async (
  participant: Participant,
  matchedParticipant: Participant
): Promise<void> => {
  const frontendUrl = window.location.origin;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Amigo Chocolate - Seu sorteio está pronto!</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #dddddd;">
          <!-- Header -->
          <tr>
            <td align="center" style="background-color: #e8e8e8; padding: 30px 20px;">
              <img src="https://imagens.rainhadassete.com.br/assinatura_rainhadassete/assinatura_arquivos/novas/logo.png" alt="Rainha das Sete" width="200" style="display: block; margin: 0 auto 15px;">
              <h1 style="color: #333333; margin: 0; font-size: 28px; font-weight: bold;">🎁 Amigo Chocolate</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 30px 20px;">
              <h2 style="color: #8B4513; margin: 0 0 15px 0; font-size: 24px;">Olá, ${participant.name}!</h2>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">O sorteio do Amigo Chocolate foi realizado! 🎉</p>
              
              <!-- Result Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #DC143C; margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 20px;">
                    <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: bold;">
                      Seu amigo chocolate é:<br>
                      <span style="font-size: 24px;">${matchedParticipant.name}</span>
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Warning Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFE4E1; border-left: 4px solid #DC143C; margin: 20px 0;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="margin: 0; color: #8B4513; font-size: 14px;">
                      🔒 <strong>Lembre-se:</strong> Mantenha o segredo! Não conte para ninguém quem você tirou.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">Acesse seu link único para ver o resultado a qualquer momento:</p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${frontendUrl}/participante/${participant.token}" style="display: inline-block; background-color: #DC143C; color: #ffffff; padding: 12px 30px; text-decoration: none; font-weight: bold; font-size: 16px;">Ver Meu Resultado</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin-top: 30px; color: #666666; font-size: 14px; line-height: 1.6;">
                Feliz Páscoa! 🐰🍫<br>
                <strong>Rainha das Sete</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const emailPayload = {
      destinatario: participant.email,
      assunto: "🎁 Amigo Chocolate - Seu sorteio está pronto!",
      body: emailHtml,
      isHtml: true,
      cc: [],
      bcc: [],
    };

    const response = await axios.post(EMAIL_API_URL, emailPayload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📧 Email enviado com sucesso:", response.data);
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    // Em caso de erro, ainda loga no console para debug
    console.log("📧 E-mail (fallback):");
    console.log(`Para: ${participant.email}`);
    console.log(`Assunto: 🎁 Amigo Chocolate - Seu sorteio está pronto!`);
    throw error;
  }
};

/**
 * Envia emails em lote para todos os participantes após o sorteio
 */
export const sendBatchEmails = async (): Promise<{
  success: boolean;
  results: any[];
  errors: any[];
}> => {
  const frontendUrl = window.location.origin;
  const results: any[] = [];
  const errors: any[] = [];

  try {
    // Buscar todos os participantes com match
    const { data: participants, error: fetchError } = await supabase
      .from("participants")
      .select("id, name, email, token, matched_with")
      .not("matched_with", "is", null);

    if (fetchError) {
      throw fetchError;
    }

    if (!participants || participants.length === 0) {
      return {
        success: false,
        results: [],
        errors: [{ message: "Nenhum participante com match encontrado" }],
      };
    }

    // Enviar email para cada participante
    for (const participant of participants) {
      try {
        // Buscar o nome do participante sorteado
        const { data: matchedParticipant } = await supabase
          .from("participants")
          .select("name")
          .eq("id", participant.matched_with)
          .single();

        const matchedName = matchedParticipant?.name || "Participante";

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Amigo Chocolate - Seu sorteio está pronto!</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #dddddd;">
          <!-- Header -->
          <tr>
            <td align="center" style="background-color: #e8e8e8; padding: 30px 20px;">
              <img src="https://imagens.rainhadassete.com.br/assinatura_rainhadassete/assinatura_arquivos/novas/logo.png" alt="Rainha das Sete" width="200" style="display: block; margin: 0 auto 15px;">
              <h1 style="color: #333333; margin: 0; font-size: 28px; font-weight: bold;">🎁 Amigo Chocolate</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 30px 20px;">
              <h2 style="color: #8B4513; margin: 0 0 15px 0; font-size: 24px;">Olá, ${participant.name}!</h2>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">O sorteio do Amigo Chocolate foi realizado! 🎉</p>
              
              <!-- Result Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #DC143C; margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 20px;">
                    <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: bold;">
                      Seu amigo chocolate é:<br>
                      <span style="font-size: 24px;">${matchedName}</span>
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Warning Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFE4E1; border-left: 4px solid #DC143C; margin: 20px 0;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="margin: 0; color: #8B4513; font-size: 14px;">
                      🔒 <strong>Lembre-se:</strong> Mantenha o segredo! Não conte para ninguém quem você tirou.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">Acesse seu link único para ver o resultado a qualquer momento:</p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td align="center">
                    <a style="color:rgb(233, 0, 0);" href="${frontendUrl}/participante/${participant.token}" style="display: inline-block; background-color: #DC143C; color: #ffffff; padding: 12px 30px; text-decoration: none; font-weight: bold; font-size: 16px;">Ver Meu Resultado</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin-top: 30px; color: #666666; font-size: 14px; line-height: 1.6;">
                Feliz Natal! 🎅🍫<br>
                <strong>Rainha das Sete</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `.trim();

        const emailPayload = {
          destinatario: participant.email,
          assunto: "🎁 Amigo Chocolate - Seu sorteio está pronto!",
          body: emailHtml,
          isHtml: true,
          cc: [],
          bcc: [],
        };

        const response = await axios.post(EMAIL_API_URL, emailPayload, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        results.push({
          participantId: participant.id,
          participantName: participant.name,
          email: participant.email,
          success: true,
          emailId: response.data?.id || response.data?.emailId || "N/A",
        });
      } catch (error) {
        let errorMessage = "Erro desconhecido";
        if (axios.isAxiosError(error)) {
          errorMessage =
            error.response?.data?.message ||
            error.message ||
            `Erro HTTP ${error.response?.status}: ${error.response?.statusText}`;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        errors.push({
          participantId: participant.id,
          participantName: participant.name,
          email: participant.email,
          error: errorMessage,
        });
      }
    }

    return {
      success: true,
      results,
      errors,
    };
  } catch (error) {
    console.error("Erro ao enviar emails em lote:", error);
    throw error;
  }
};

/**
 * Envia um email de teste para verificar a configuração
 */
export const testEmail = async (
  testEmailAddress: string
): Promise<{
  success: boolean;
  message: string;
  emailId?: string;
}> => {
  const frontendUrl = window.location.origin;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teste - Amigo Chocolate</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #dddddd;">
          <!-- Header -->
          <tr>
            <td align="center" style="background-color: #e8e8e8; padding: 30px 20px;">
              <img src="https://imagens.rainhadassete.com.br/assinatura_rainhadassete/assinatura_arquivos/novas/logo.png" alt="Rainha das Sete" width="200" style="display: block; margin: 0 auto 15px;">
              <h1 style="color: #333333; margin: 0; font-size: 28px; font-weight: bold;">🎁 Amigo Chocolate</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 30px 20px;">
              <h2 style="color: #8B4513; margin: 0 0 15px 0; font-size: 24px;">Olá! Este é um email de teste 🧪</h2>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Se você está recebendo este email, significa que a configuração de envio de emails está funcionando corretamente! ✅</p>
              
              <!-- Result Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #DC143C; margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 20px;">
                    <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: bold;">
                      Exemplo de resultado:<br>
                      <span style="font-size: 24px;">João Silva</span>
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Warning Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFE4E1; border-left: 4px solid #DC143C; margin: 20px 0;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="margin: 0; color: #8B4513; font-size: 14px;">
                      🔒 <strong>Lembre-se:</strong> Mantenha o segredo! Não conte para ninguém quem você tirou.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">Este é apenas um email de teste para verificar a configuração.</p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${frontendUrl}" style="display: inline-block; background-color: #DC143C; color: #ffffff; padding: 12px 30px; text-decoration: none; font-weight: bold; font-size: 16px;">Acessar Sistema</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin-top: 30px; color: #666666; font-size: 14px; line-height: 1.6;">
                Feliz Páscoa! 🐰🍫<br>
                <strong>Rainha das Sete</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const emailPayload = {
      destinatario: testEmailAddress,
      assunto: "🧪 Teste - Amigo Chocolate",
      body: emailHtml,
      isHtml: true,
      cc: [],
      bcc: [],
    };

    const response = await axios.post(EMAIL_API_URL, emailPayload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      message: "Email de teste enviado com sucesso!",
      emailId: response.data?.id || response.data?.emailId || "N/A",
    };
  } catch (error) {
    console.error("Erro ao enviar email de teste:", error);
    throw error;
  }
};
