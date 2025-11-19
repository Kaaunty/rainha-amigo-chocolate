import { useState, useEffect } from "react";
import {
  getAllParticipants,
  getDrawStatus,
  updateMinParticipants,
  resetDraw,
  performDraw,
  exportParticipants,
  sendBatchEmails,
} from "../services/api";
import AdminLogin from "../components/AdminLogin";
import LoadingSpinner from "../components/LoadingSpinner";
import type { Participant, DrawStatus } from "../types";
import "./Admin.css";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [drawStatus, setDrawStatus] = useState<DrawStatus | null>(null);
  const [minParticipants, setMinParticipants] = useState(5);
  const [updatingMin, setUpdatingMin] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [performingDraw, setPerformingDraw] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Verificar se já está autenticado
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      setIsAuthenticated(true);
      loadData();
    } else {
      setLoading(false);
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [participantsData, statusData] = await Promise.all([
        getAllParticipants(),
        getDrawStatus(),
      ]);
      setParticipants(participantsData);
      setDrawStatus(statusData);
      setMinParticipants(statusData.minParticipants);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados.");
      // Se erro 401, desautenticar
      if (err instanceof Error && err.message.includes("401")) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    loadData();
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    setParticipants([]);
    setDrawStatus(null);
  };

  const handleUpdateMinParticipants = async () => {
    if (minParticipants < 2) {
      setError("O número mínimo deve ser pelo menos 2.");
      return;
    }

    try {
      setUpdatingMin(true);
      setError("");
      await updateMinParticipants({ minParticipants });
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar configuração."
      );
    } finally {
      setUpdatingMin(false);
    }
  };

  const handlePerformDraw = async () => {
    if (
      !confirm(
        "Tem certeza que deseja realizar o sorteio agora? Depois você poderá enviar os emails manualmente para todos os participantes."
      )
    ) {
      return;
    }

    try {
      setPerformingDraw(true);
      setError("");
      await performDraw();
      await loadData();
      alert(
        "Sorteio realizado com sucesso! Agora você pode enviar os emails pelo botão 'Enviar Emails'."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao realizar sorteio."
      );
    } finally {
      setPerformingDraw(false);
    }
  };

  const handleResetDraw = async () => {
    if (
      !confirm(
        "Tem certeza que deseja reiniciar o sorteio? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      setResetting(true);
      setError("");
      await resetDraw();
      await loadData();
      alert("Sorteio reiniciado com sucesso!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao reiniciar sorteio."
      );
    } finally {
      setResetting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      setError("");
      const blob = await exportParticipants();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `participantes-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao exportar CSV.");
    } finally {
      setExporting(false);
    }
  };

  const handleSendEmails = async () => {
    if (!drawStatus?.isDrawn) {
      alert("O sorteio ainda não foi realizado. Realize o sorteio primeiro.");
      return;
    }

    if (
      !confirm(
        "Deseja enviar emails para todos os participantes? Esta ação enviará emails para todos que foram sorteados."
      )
    ) {
      return;
    }

    try {
      setSendingEmails(true);
      setError("");
      const result = await sendBatchEmails();

      if (result.success) {
        const successCount = result.results?.length || 0;
        const errorCount = result.errors?.length || 0;
        alert(
          `Emails enviados com sucesso!\n${successCount} emails enviados${
            errorCount > 0 ? `\n${errorCount} erros` : ""
          }`
        );
      } else {
        throw new Error(result.message || "Erro ao enviar emails");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar emails.");
    } finally {
      setSendingEmails(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <AdminLogin onSuccess={handleLoginSuccess} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-container">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">
            <span className="title-icon">👑</span>
            Painel Administrativo
          </h1>
          <button onClick={handleLogout} className="logout-button">
            Sair
          </button>
        </div>

        {error && (
          <div className="admin-error" role="alert">
            {error}
          </div>
        )}

        {/* Estatísticas */}
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">
                {drawStatus?.totalParticipants || 0}
              </div>
              <div className="stat-label">Participantes</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-value">
                {drawStatus?.minParticipants || 5}
              </div>
              <div className="stat-label">Mínimo Necessário</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">{drawStatus?.isDrawn ? "✅" : "⏳"}</div>
            <div className="stat-content">
              <div className="stat-value">
                {drawStatus?.isDrawn ? "Realizado" : "Pendente"}
              </div>
              <div className="stat-label">Status do Sorteio</div>
            </div>
          </div>
        </div>

        {/* Configurações */}
        <div className="admin-section">
          <h2 className="section-title">Configurações</h2>
          <div className="config-card">
            <div className="config-item">
              <label htmlFor="minParticipants" className="config-label">
                Número Mínimo de Participantes
              </label>
              <div className="config-input-group">
                <input
                  type="number"
                  id="minParticipants"
                  className="config-input"
                  value={minParticipants}
                  onChange={(e) =>
                    setMinParticipants(parseInt(e.target.value) || 2)
                  }
                  min="2"
                />
                <button
                  onClick={handleUpdateMinParticipants}
                  disabled={updatingMin}
                  className="config-button"
                >
                  {updatingMin ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="admin-section">
          <h2 className="section-title">Ações</h2>
          <div className="actions-grid">
            {!drawStatus?.isDrawn && drawStatus?.canDraw && (
              <button
                onClick={handlePerformDraw}
                disabled={performingDraw}
                className="action-card primary"
              >
                <span className="action-icon">🎲</span>
                <span className="action-text">
                  {performingDraw
                    ? "Realizando sorteio..."
                    : "Realizar Sorteio"}
                </span>
              </button>
            )}
            {drawStatus?.isDrawn && (
              <button
                onClick={handleSendEmails}
                disabled={sendingEmails || participants.length === 0}
                className="action-card email"
              >
                <span className="action-icon">📧</span>
                <span className="action-text">
                  {sendingEmails ? "Enviando emails..." : "Enviar Emails"}
                </span>
              </button>
            )}
            <button
              onClick={handleExportCSV}
              disabled={exporting || participants.length === 0}
              className="action-card"
            >
              <span className="action-icon">📥</span>
              <span className="action-text">
                {exporting ? "Exportando..." : "Exportar CSV"}
              </span>
            </button>
            <button
              onClick={handleResetDraw}
              disabled={resetting}
              className="action-card danger"
            >
              <span className="action-icon">🔄</span>
              <span className="action-text">
                {resetting ? "Reiniciando..." : "Reiniciar Sorteio"}
              </span>
            </button>
          </div>
        </div>

        {/* Lista de Participantes */}
        <div className="admin-section">
          <h2 className="section-title">Participantes Cadastrados</h2>
          {participants.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>Nenhum participante cadastrado ainda.</p>
            </div>
          ) : (
            <div className="participants-list">
              {participants.map((participant) => (
                <div key={participant.id} className="participant-item">
                  <div className="participant-info">
                    <div className="participant-name">{participant.name}</div>
                    <div className="participant-email">{participant.email}</div>
                    <div className="participant-token">
                      Token: <code>{participant.token}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
