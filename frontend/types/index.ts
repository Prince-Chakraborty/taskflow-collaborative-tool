export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  owner_name: string;
  member_role: string;
  board_count: number;
  member_count: number;
  list_count?: number;
  card_count?: number;
  created_at: string;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  workspace_id: string;
  created_by: string;
  created_by_name: string;
  background_color: string;
  is_archived: boolean;
  lists: List[];
  created_at: string;
  list_count?: number;
  card_count?: number;
}

export interface List {
  id: string;
  name: string;
  board_id: string;
  position: number;
  cards: Card[];
  created_at: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  list_id: string;
  list_name?: string;
  board_id: string;
  created_by: string;
  created_by_name: string;
  assigned_to?: string;
  assigned_to_name?: string;
  assigned_to_avatar?: string;
  position: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  labels: string[];
  is_archived: boolean;
  checklists: Checklist[];
  comments: Comment[];
  attachments: Attachment[];
  created_at: string;
}

export interface Checklist {
  id: string;
  card_id: string;
  title: string;
  is_completed: boolean;
  position: number;
  created_at: string;
}

export interface Comment {
  id: string;
  card_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  card_id: string;
  uploaded_by: string;
  uploaded_by_name: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  board_id: string;
  card_id?: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  action: string;
  details: Record<string, any>;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
