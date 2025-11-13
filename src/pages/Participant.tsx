import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getParticipantByToken, getDrawStatus } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { FireworksBackground } from "../components/ui/shadcn-io/fireworks-background";
import type { Participant as ParticipantType } from "../types";
import "./Participant.css";

const Participant = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [participant, setParticipant] = useState<ParticipantType | null>(null);
  const [matchedParticipant, setMatchedParticipant] =
    useState<ParticipantType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawStatus, setDrawStatus] = useState<{
    isDrawn: boolean;
    totalParticipants: number;
    minParticipants: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Token inválido.");
        setLoading(false);
        return;
      }

      try {
        // Buscar status do sorteio
        const status = await getDrawStatus();
        setDrawStatus({
          isDrawn: status.isDrawn,
          totalParticipants: status.totalParticipants,
          minParticipants: status.minParticipants,
        });

        // Buscar dados do participante
        const response = await getParticipantByToken(token);
        setParticipant(response.participant);

        if (response.matchedParticipant) {
          setMatchedParticipant(response.matchedParticipant);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar dados do participante."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="participant-container">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="participant-container">
        <div className="error-card">
          <div className="error-icon">❌</div>
          <h2 className="error-title">Erro</h2>
          <p className="error-message">{error}</p>
          <button onClick={() => navigate("/")} className="error-button">
            Voltar para a página inicial
          </button>
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="participant-container">
        <div className="error-card">
          <div className="error-icon">🔍</div>
          <h2 className="error-title">Participante não encontrado</h2>
          <p className="error-message">
            O link fornecido não é válido ou o participante não foi encontrado.
          </p>
          <button onClick={() => navigate("/")} className="error-button">
            Voltar para a página inicial
          </button>
        </div>
      </div>
    );
  }

  const isDrawComplete = drawStatus?.isDrawn ?? false;
  const hasMatch = matchedParticipant !== null;
  const showFireworks = isDrawComplete && hasMatch;

  return (
    <div className="participant-container">
      <FireworksBackground
        active={showFireworks}
        fireworkSpeed={{ min: 8, max: 16 }}
        fireworkSize={{ min: 4, max: 10 }}
        particleSpeed={{ min: 4, max: 14 }}
        particleSize={{ min: 2, max: 10 }}
      />
      <div className="participant-card">
        <div className="participant-header">
          <h1 className="participant-title">
            <span className="title-icon">🍫</span>
            Olá, {participant.name}!
          </h1>
          <p className="participant-subtitle">
            Seu resultado do Amigo Chocolate
          </p>
        </div>

        {!isDrawComplete ? (
          <div className="waiting-section">
            <div className="waiting-icon">⏳</div>
            <h2 className="waiting-title">Aguardando sorteio</h2>
            <p className="waiting-message">
              O sorteio ainda não foi realizado. Estamos aguardando mais
              participantes.
            </p>
            {drawStatus && (
              <div className="status-info">
                <p>
                  <strong>{drawStatus.totalParticipants}</strong> de{" "}
                  <strong>{drawStatus.minParticipants}</strong> participantes
                  cadastrados
                </p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(
                        (drawStatus.totalParticipants /
                          drawStatus.minParticipants) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <p className="progress-text">
                  {drawStatus.totalParticipants >= drawStatus.minParticipants
                    ? "Sorteio será realizado em breve!"
                    : `Faltam ${
                        drawStatus.minParticipants -
                        drawStatus.totalParticipants
                      } participantes`}
                </p>
              </div>
            )}
            <button onClick={() => navigate("/")} className="action-button">
              Voltar para a página inicial
            </button>
          </div>
        ) : !hasMatch ? (
          <div className="no-match-section">
            <div className="no-match-icon">🤔</div>
            <h2 className="no-match-title">Resultado não disponível</h2>
            <p className="no-match-message">
              Você ainda não foi sorteado. Entre em contato com o administrador.
            </p>
            <button onClick={() => navigate("/")} className="action-button">
              Voltar para a página inicial
            </button>
          </div>
        ) : (
          <div className="result-section">
            <div className="result-icon">🎁</div>
            <h2 className="result-title">Seu amigo chocolate é:</h2>
            <div className="matched-name">{matchedParticipant.name}</div>
            <div className="result-message">
              <p>
                🎉 Parabéns! Você tirou{" "}
                <strong>{matchedParticipant.name}</strong> no sorteio!
              </p>
              <p className="secret-reminder">
                🔒 <strong>Lembre-se:</strong> Mantenha o segredo! Não conte
                para ninguém quem você tirou.
              </p>
            </div>
            <div className="result-actions">
              <button
                onClick={() => navigate("/regras")}
                className="action-button secondary"
              >
                Ver regras
              </button>
              <button
                onClick={() => navigate("/")}
                className="action-button primary"
              >
                Voltar para a página inicial
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Participant;
