import { useState, FormEvent } from "react";
import { registerParticipant } from "../services/api";
import "./ParticipantForm.css";

interface ParticipantFormProps {
  onSuccess: (link: string) => void;
}

const ParticipantForm = ({ onSuccess }: ParticipantFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string): boolean => {
    // Validação básica de e-mail corporativo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Validações
    if (!name.trim()) {
      setError("Por favor, informe seu nome.");
      return;
    }

    if (!email.trim()) {
      setError("Por favor, informe seu e-mail corporativo.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor, informe um e-mail válido.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerParticipant({
        name: name.trim(),
        email: email.trim(),
      });
      onSuccess(response.link);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao cadastrar participante. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="participant-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Nome Completo
        </label>
        <input
          type="text"
          id="name"
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite seu nome"
          disabled={loading}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          E-mail Corporativo
        </label>
        <input
          type="email"
          id="email"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu.email@empresa.com"
          disabled={loading}
          required
        />
      </div>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <button type="submit" className="form-button" disabled={loading}>
        {loading ? (
          <>
            <span className="button-spinner">🍫</span>
            Participando...
          </>
        ) : (
          <>
            <span className="text-white">Participar</span>
          </>
        )}
      </button>
    </form>
  );
};

export default ParticipantForm;
