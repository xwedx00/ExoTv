//@ts-nocheck
import { SkeletonProps } from "@/components/shared/Skeleton";
import { SupabaseQueryFunction, SupabaseQueryOptions } from "@/utils/supabase";
import { User } from "@supabase/gotrue-js";
import { QueryKey } from "react-query";
import { Media, MediaTitle as ALMediaTitle, MediaType } from "./anilist";

export interface MediaTitle extends Partial<ALMediaTitle> {
  [key: string]: string;
}

export type AdditionalUser = User & {
  authRole: string;
  isVerified: boolean;
  avatarUrl: string;
  bannerUrl: string;
  name: string;
  username: string;
  bio: string;
};

export type MediaDescription = Record<string, string>;

export interface Section<T> {
  title: string;
  query?: {
    key: QueryKey;
    queryFn: SupabaseQueryFunction<T>;
    options?: SupabaseQueryOptions<T>;
  };
  skeleton: React.ComponentType<SkeletonProps>;
  render: (data: T[]) => React.ReactNode;
  clientData?: () => void;
}

export interface Watched {
  media: Media;
  episode: Episode;
  episodeId: string;
  mediaId?: number;
  userId: string;
  updated_at?: string;
  created_at?: string;
  watchedTime?: number;
  episodeNumber?: number;
}

export interface Read {
  media: Media;
  mediaId?: number;
  chapterId?: string;
  chapter: Chapter;
  userId: string;
  updated_at?: string;
  created_at?: string;
}

export interface Reaction {
  type: string;
  created_at: string;
  label: string;
  url: string;
  metadata: any;
}

export interface CommentReaction {
  id: string;
  user_id: string;
  comment_id: string;
  reaction_type: string;
  created_at: string;
  user: DisplayUser;
}

export interface ReplyComment {
  comment: Comment;
}

export interface CommentReactionMetadata {
  comment_id: string;
  reaction_type: string;
  reaction_count: number;
  active_for_user: boolean;
}

export interface DisplayUser {
  id: string;
  name: string;
  avatar: string;
  username: string;
  role: string;
}

export interface Comment {
  id: string;
  user_id: string;
  parent_id: string | null;
  topic: string;
  comment: string;
  created_at: string;
  replies_count: number;
  reactions_metadata?: CommentReactionMetadata[];
  user: DisplayUser;
  mentioned_user_ids?: string[];
}



export type BasicRoomUser = {
  name?: string | null;
  avatarUrl?: string | null;
  userId: string;
  isGuest?: boolean;
};

export type RoomUser = {
  id: string; // Socket id
  roomId: number;
  peerId: string;
  isMicMuted: boolean;
  isHeadphoneMuted: boolean;
  useVoiceChat: boolean;
} & BasicRoomUser;



export type Room = {
  id: number;
  hostUser: AdditionalUser;
  hostUserId: string;
  mediaId: number;
  media: Media;
  created_at?: string;
  episode: Episode;
  episodeId: string;
  users: RoomUser[];
  title?: string;
  episodes: Episode[];
  visibility: "public" | "private";
};

export type Chat = {
  body?: string;
  user: RoomUser;
  type: "event" | "message";
  eventType?: string;
};

export type ChatMessage = {
  body: string;
  user: RoomUser;
};

export type ChatEvent = {
  user: RoomUser;
  eventType: string;
};

export type CallbackSetter<T> = (handler: T) => void;

export type Noop = () => void;

export type WatchStatus = "WATCHING" | "COMPLETED" | "PLANNING";
export type ReadStatus = "READING" | "COMPLETED" | "PLANNING";

export type SourceStatus<T> = (T extends MediaType.Anime
  ? {
      status?: WatchStatus;
      mediaId?: number;
      media?: Media;
    }
  : {
      status?: ReadStatus;
      mediaId?: number;
      media?: Media;
    }) & {
  userId?: string;
  user?: User;
  updated_at?: string;
  created_at?: string;
};

export type SkipType = "ed" | "op" | "mixed-ed" | "mixed-op" | "recap";

export interface SkipTimeStamp {
  interval: {
    startTime: number;
    endTime: number;
  };
  skipType: SkipType;
  skipId: string;
  episodeLength: number;
}

export interface AnimeSongTheme {
  title: string;
}
export interface AnimeTheme {
  slug: string;
  song: AnimeSongTheme;
  name: string;
  type: string;
  episode: string;
  sources: VideoSource[];
  anilistId?: number;
}


export type NotificationUser = {
  id: number;
  userId: string;
  notificationId: string;
  created_at: string;
  updated_at: string;
  isRead: boolean;
};

export type Notification = {
  id: number;
  senderId: string;
  sender: AdditionalUser;
  receiverId: string;
  entityId: string;
  parentEntityId: string;
  entityType: string;
  updated_at: string;
  created_at: string;
  notificationUsers: NotificationUser[];
};

export type NotificationEntity = {
  message: string;
  redirectUrl: string;
};
