import { gql } from "@apollo/client";

export const INSERT_CHAT_HEADER = gql`
mutation insertChatHeader($newChatHeader:newChatHeader!){
  createChat(inputChatHeader:$newChatHeader)
}
`

export const INSERT_INSTANT_CHAT_HEADER = gql`
mutation insertInstantChatHeader($inputChatHeader:newChatHeader!){
  createInstantChat(inputChatHeader:$inputChatHeader){
    id
  }
}
`

export const INSERT_CHAT_DETAILS = gql`
mutation addMsg($newChatDetail:newChatDetail!){
  createMessage(inputChatDetail:$newChatDetail)
}
`

export const GET_ALL_CHATS = gql`
  query getConvo($userId:String!){
    getAllConversation(userId:$userId){
      chatHeaderId
      chatHeaderInformation{
        id
        userId1
        userId2
        createdAt
      }
      chatDetailsInformation{
        id
        chatHeaderId
        senderId
        chatText
        createdAt
        type
        mediaUrl
      }
      userId1Data{
        firstname
        surname
        profilepic
      }
      userId2Data{
        firstname
        surname
        profilepic
      }
      postData{
        id
        contentText
        postDate
        postPrivacy
      }
      postAuthor{
        id
        firstname
        surname
        profilepic
        Dob
      }
    }
  }
`

export const GET_CHAT_HEADER = gql`
query getChatHeader($userId1:String!, $userId2: String!){
  getChatHeader(userId1:$userId1, userId2:$userId2)
}
`

export const GET_MEDIA_POST = gql`
  query getMedia($postId:ID!){
    getAllMedia(postId:$postId){
      postId
      mediaUrl
    }
  }
`