export interface Participant {
  id: string;
  name: string;
  email: string;
  token: string;
  createdAt: string;
  matchedWith?: string; // ID do amigo chocolate
  matchedWithName?: string; // Nome do amigo chocolate (para facilitar exibição)
}

export interface DrawStatus {
  isDrawn: boolean;
  totalParticipants: number;
  minParticipants: number;
  canDraw: boolean;
}

export interface AdminConfig {
  minParticipants: number;
}

export interface RegisterParticipantRequest {
  name: string;
  email: string;
}

export interface RegisterParticipantResponse {
  participant: Participant;
  link: string;
}

export interface ParticipantResponse {
  participant: Participant;
  matchedParticipant?: Participant;
}

export interface AdminLoginRequest {
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  token?: string;
}

export interface UpdateMinParticipantsRequest {
  minParticipants: number;
}

