import Peer from 'simple-peer'
export interface LastMessage {
  _id: string;
  messageText: string;
  createdAt: string;
  senderId: string;
  senderName: string | undefined;
  image: string;
  audio:string
  call:boolean
}

export interface Message {
  _id: string;
  chatId: string;
  senderId: string;
  messageText: string;
  image?: string;
  audio?:string
  call?:boolean
  createdAt: string;
  readAt: Date;
}

export interface OtherUser {
  _id: string;
  username: string;
  email: string;
  profilePhoto: string;
}

export interface User{
  username : string;
  email : string;
  password : string;
  isBlocked : boolean;
  country : Country
  nativeLanguage : Language
  knownLanguages : Language[]
  languagesToLearn : Language[]
  profilePhoto : string
  bio : string
  sentRequests: User[]; 
  receivedRequests: User[]; 
  connections: User[]; 
  isSubscribed :boolean;
  expirationDate : Date
}

export interface Country{
  countryName : string,
  isBlocked : boolean
}

export interface Language{
  languageName : string;
  countries :  Country[];
  isBlocked : boolean
}

export interface Participants{
  caller:User
  receiver:User 
}

export interface OngoingCall{
  participants:Participants
  isRinging:boolean
} 

export interface ChatProps {
  currentUserId: string;
  otherUserId: string;
  otherUserDetails: OtherUser;
  onNewMessage: (chatId: string, newMessage: LastMessage) => void;
  onMessagesRead: (chatId: string) => void;

}

export interface CheckChatProps {
  currentUserId:string
  otherUserId:string
  otherUserDetails: User
  onNewMessage:(userId:string,messageData:LastMessage) => void
  onMessagesRead:(userId:string)=> void

}

export interface IVideoContainer{
  stream:MediaStream | null
  isLocalStream:boolean
  isOnCall:boolean
  className?: string; 
}

export interface IVideoCall{
  localStream:MediaStream|null
  isOnCall: boolean;
  peer: PeerData | null
}

export interface PeerData{
  peerConnection :Peer.Instance
  stream :MediaStream | undefined
  participantUser:User
}