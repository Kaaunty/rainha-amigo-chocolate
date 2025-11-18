import { supabase } from "../lib/supabase";
import axios from "axios";
import type {
  RegisterParticipantRequest,
  RegisterParticipantResponse,
  ParticipantResponse,
  DrawStatus,
  AdminLoginRequest,
  AdminLoginResponse,
  UpdateMinParticipantsRequest,
  Participant,
} from "../types";

const EMAIL_API_URL = "https://api.erp.rainhadassete.com/api/Email/enviar";

// Função auxiliar para tratamento de erros
const handleError = (error: any): never => {
  if (error?.message) {
    throw new Error(error.message);
  }
  throw new Error("Erro desconhecido");
};

// Função auxiliar para verificar autenticação admin
const checkAdminAuth = (): string => {
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) {
    throw new Error("Não autorizado");
  }
  return adminToken;
};

// Função para gerar CSV
const generateCSV = (participants: Participant[]): Blob => {
  const csvHeader = "Nome,Email,Token,Data Cadastro,Amigo Chocolate\n";
  const csvRows = participants
    .map((p) => {
      const date = new Date(p.createdAt).toLocaleDateString("pt-BR");
      const matchedName = p.matchedWithName || "";
      return `"${p.name}","${p.email}","${p.token}","${date}","${matchedName}"`;
    })
    .join("\n");

  const csv = csvHeader + csvRows;
  return new Blob([csv], { type: "text/csv;charset=utf-8;" });
};

// Funções de API

export const registerParticipant = async (
  data: RegisterParticipantRequest
): Promise<RegisterParticipantResponse> => {
  try {
    // Validar dados
    if (!data.name || !data.email) {
      throw new Error("Nome e e-mail são obrigatórios");
    }

    // Validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("E-mail inválido");
    }

    // Gerar token único
    const { data: token, error: tokenError } = await supabase.rpc(
      "generate_unique_token"
    );

    if (tokenError) {
      throw tokenError;
    }

    // Inserir participante
    const { data: participant, error } = await supabase
      .from("participants")
      .insert({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        token: token,
        preferred_chocolate: data.preferredChocolate?.trim() || null,
        dislikes: data.dislikes?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("Este e-mail já está cadastrado");
      }
      throw error;
    }

    // Construir link
    const frontendUrl = window.location.origin;
    const link = `${frontendUrl}/participante/${token}`;

    return {
      participant: {
        id: participant.id,
        name: participant.name,
        email: participant.email,
        token: participant.token,
        createdAt: participant.created_at,
        matchedWith: participant.matched_with || undefined,
        preferredChocolate: participant.preferred_chocolate || undefined,
        dislikes: participant.dislikes || undefined,
      },
      link: link,
    };
  } catch (error: any) {
    return handleError(error);
  }
};

export const getParticipantByToken = async (
  token: string
): Promise<ParticipantResponse> => {
  try {
    if (!token) {
      throw new Error("Token não fornecido");
    }

    // Buscar participante pelo token
    const { data: participant, error } = await supabase
      .from("participants")
      .select("*")
      .eq("token", token)
      .single();

    if (error || !participant) {
      throw new Error("Participante não encontrado");
    }

    let matchedParticipant = null;

    // Se tem matched_with, buscar o participante correspondente
    if (participant.matched_with) {
      const { data: matched, error: matchedError } = await supabase
        .from("participants")
        .select("id, name, email, token, created_at, preferred_chocolate, dislikes")
        .eq("id", participant.matched_with)
        .single();

      if (!matchedError && matched) {
        matchedParticipant = {
          id: matched.id,
          name: matched.name,
          email: matched.email,
          token: matched.token,
          createdAt: matched.created_at,
          matchedWith: participant.id,
          matchedWithName: participant.name,
          preferredChocolate: matched.preferred_chocolate || undefined,
          dislikes: matched.dislikes || undefined,
        };
      }
    }

    return {
      participant: {
        id: participant.id,
        name: participant.name,
        email: participant.email,
        token: participant.token,
        createdAt: participant.created_at,
        matchedWith: participant.matched_with || undefined,
        matchedWithName: matchedParticipant?.name || undefined,
        preferredChocolate: participant.preferred_chocolate || undefined,
        dislikes: participant.dislikes || undefined,
      },
      matchedParticipant: matchedParticipant || undefined,
    };
  } catch (error: any) {
    return handleError(error);
  }
};

export const getAllParticipants = async (): Promise<Participant[]> => {
  try {
    checkAdminAuth(); // Verificar autenticação

    // Buscar todos os participantes
    const { data: participants, error } = await supabase
      .from("participants")
      .select("id, name, email, token, created_at, matched_with, preferred_chocolate, dislikes")
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    if (!participants || participants.length === 0) {
      return [];
    }

    // Buscar nomes dos matches separadamente para evitar ambiguidade
    const matchedIds = participants
      .filter((p) => p.matched_with)
      .map((p) => p.matched_with) as string[];

    let matchedNames: Record<string, string> = {};

    if (matchedIds.length > 0) {
      const { data: matched, error: matchedError } = await supabase
        .from("participants")
        .select("id, name")
        .in("id", matchedIds);

      if (!matchedError && matched) {
        matchedNames = matched.reduce((acc: Record<string, string>, p: any) => {
          acc[p.id] = p.name;
          return acc;
        }, {});
      }
    }

    // Formatar resposta
    return participants.map((p: any) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      token: p.token,
      createdAt: p.created_at,
      matchedWith: p.matched_with || undefined,
      matchedWithName: p.matched_with
        ? matchedNames[p.matched_with] || undefined
        : undefined,
      preferredChocolate: p.preferred_chocolate || undefined,
      dislikes: p.dislikes || undefined,
    }));
  } catch (error: any) {
    return handleError(error);
  }
};

export const getDrawStatus = async (): Promise<DrawStatus> => {
  try {
    const { data: status, error } = await supabase.rpc("get_draw_status");

    if (error) {
      throw error;
    }

    return status;
  } catch (error: any) {
    return handleError(error);
  }
};

export const adminLogin = async (
  data: AdminLoginRequest
): Promise<AdminLoginResponse> => {
  try {
    if (!data.password) {
      return {
        success: false,
      };
    }

    // Verificar senha usando função RPC
    const { data: isValid, error: verifyError } = await supabase.rpc(
      "verify_admin_password",
      {
        password_input: data.password,
      }
    );

    if (verifyError || !isValid) {
      return {
        success: false,
      };
    }

    // Gerar token simples (em produção, use JWT adequado)
    const token = btoa(
      JSON.stringify({
        admin: true,
        timestamp: Date.now(),
      })
    );

    localStorage.setItem("adminToken", token);

    return {
      success: true,
      token: token,
    };
  } catch (error: any) {
    return {
      success: false,
    };
  }
};

export const exportParticipants = async (): Promise<Blob> => {
  try {
    checkAdminAuth();

    // Buscar todos os participantes
    const participants = await getAllParticipants();

    // Gerar CSV
    return generateCSV(participants);
  } catch (error: any) {
    return handleError(error);
  }
};

export const resetDraw = async (): Promise<void> => {
  try {
    checkAdminAuth();

    const { error } = await supabase.rpc("reset_draw");

    if (error) {
      throw error;
    }
  } catch (error: any) {
    return handleError(error);
  }
};

export const performDraw = async (): Promise<void> => {
  try {
    checkAdminAuth();

    const { data: result, error } = await supabase.rpc("perform_draw");

    if (error) {
      throw error;
    }

    if (result && !result.success) {
      throw new Error(result.message || "Erro ao executar sorteio");
    }

    // Enviar emails automaticamente após o sorteio ser realizado com sucesso
    if (result && result.success) {
      try {
        const { sendBatchEmails } = await import("./email");
        const emailResult = await sendBatchEmails();

        if (emailResult.success) {
          console.log(
            `📧 Emails enviados: ${emailResult.results.length} sucesso, ${emailResult.errors.length} erros`
          );
        } else {
          console.warn(
            "⚠️ Alguns emails não foram enviados:",
            emailResult.errors
          );
        }
      } catch (emailError) {
        // Não falha o sorteio se o envio de emails falhar, apenas loga o erro
        console.error("Erro ao enviar emails após o sorteio:", emailError);
      }
    }
  } catch (error: any) {
    return handleError(error);
  }
};

export const sendBatchEmails = async (): Promise<{
  success: boolean;
  results: any[];
  errors: any[];
  message: string;
}> => {
  try {
    checkAdminAuth();

    // Importar a função do serviço de email que já tem a lógica completa
    const { sendBatchEmails: sendBatchEmailsFromEmailService } = await import(
      "./email"
    );
    const result = await sendBatchEmailsFromEmailService();
    return {
      ...result,
      message: result.success
        ? `Emails enviados: ${result.results.length} sucesso, ${result.errors.length} erros`
        : "Erro ao enviar emails em lote",
    };
  } catch (error: any) {
    return handleError(error);
  }
};

export const testEmail = async (
  testEmailAddress: string
): Promise<{
  success: boolean;
  message: string;
  emailId?: string;
}> => {
  try {
    checkAdminAuth();

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

    console.log("📧 Enviando email de teste para:", testEmailAddress);
    console.log("🌐 API URL:", EMAIL_API_URL);

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
  } catch (error: any) {
    return handleError(error);
  }
};

export const updateMinParticipants = async (
  data: UpdateMinParticipantsRequest
): Promise<void> => {
  try {
    checkAdminAuth();

    if (!data.minParticipants || data.minParticipants < 2) {
      throw new Error("Número mínimo deve ser pelo menos 2");
    }

    // Atualizar configuração usando função RPC
    const { data: result, error } = await supabase.rpc(
      "update_min_participants",
      {
        min_participants_value: data.minParticipants,
      }
    );

    if (error) {
      throw error;
    }

    if (result && !result.success) {
      throw new Error(result.message || "Erro ao atualizar configuração");
    }
  } catch (error: any) {
    return handleError(error);
  }
};
