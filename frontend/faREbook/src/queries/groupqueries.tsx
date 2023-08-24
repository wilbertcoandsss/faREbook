import { gql } from "@apollo/client";

export const ADD_NEW_GROUP = gql`
mutation createGroup($newGroup:NewGroup!){
  insertGroup(newGroup:$newGroup){
    ID
    GroupName
    GroupPrivacy
  }
}
`

export const ADD_NEW_GROUP_MEMBER = gql`
mutation InsertGroupMember($newMember:NewGroupMember!){
  insertGroupMember(newGroupMember:$newMember)
}
`

export const GET_ALL_GROUPS = gql`
query getAllGroups{
  getAllGroup{
    ID
    GroupName
    GroupPrivacy
    GroupDesc
    GroupAdmin
    GroupBannerPic
    GroupMember{
      GroupMember{
        UserID
        GroupID
        Role
        Status
      }
      UserData{
        id
        firstname
        surname
      }
    }
  }
}
`

export const GET_GROUP_BY_USERID = gql`
query getGroupById($userId:ID!){
  getGroupById(userId:$userId){
    ID
    GroupName
    GroupPrivacy
    GroupDesc
    GroupAdmin
    GroupBannerPic
    GroupMember{
      GroupMember{
        UserID
        GroupID
        Role
        Status
      }
      UserData{
        id
        firstname
        surname

      profilepic
      }
    }
  }
}
`

export const GET_GROUP_INFO = gql`
query getGroupInfo($groupId:ID!){
  getGroupInfo(groupId:$groupId){
    ID
    GroupName
    GroupPrivacy
    GroupDesc
    GroupAdmin
    GroupBannerPic
    GroupCreated
    GroupMember{
      GroupMember
      {
        UserID
        GroupID
        Role
        Status
      }
      UserData{
        id
        firstname
        surname
        profilepic
      }
    }
  }
}
`

export const GET_GROUP_POST = gql`
query getGroupPosts($limit: Int!, $offset: Int!, $groupId:ID!) {
  getAllGroupPost(limit: $limit, offset: $offset,groupId:$groupId) {
    id
    contentText
    authorId
    postDate
    authorData {
      id
      firstname
      surname
    }
    likedCount
    mediaUrl
    postPrivacy
  }
}
`

export const INSERT_GROUP_POST = gql`
mutation insertGroupPost($newGroupPost:NewGroupPostInput!){
  insertGroupPost(inputGroupPost:$newGroupPost){
    id
    groupId
    contentText
    authorId
    postDate
    postPrivacy
  }
}
`

export const GET_GROUP_FILES = gql`
query getGroupFiles($groupId:ID!){
  getGroupFiles(groupId:$groupId){
    ID
    GroupId
    OwnerId
    FileName
    UploadedDate
    MediaUrl
    OwnerData{
      id
      firstname
      surname
      email
      profilepic
    }
    FileType
  }
}
`

export const INSERT_FILES = gql`
mutation insertFile($newFile:NewFiles!){
  createGroupFile(newFile:$newFile){
    ID
    GroupId
    OwnerId
    FileName
    UploadedDate
    MediaUrl
  }
}
`

export const CHECK_ROLE = gql`
query checkkRole($groupId:ID!, $userId:ID!){
  checkRole(groupId:$groupId, userId:$userId)
}
`

export const DELETE_FILE = gql`
mutation deleteFile($fileId:ID!){
  deleteFile(fileId:$fileId)
}
`

export const CHECK_INV_GROUP = gql`
query checkInv($userId:ID!){
  checkInvitation(userId:$userId){
    ID
    GroupName
    GroupPrivacy
    GroupDesc
    GroupAdmin
    GroupBannerPic
    GroupCreated
  }
}
`

export const ACC_INV = gql`
mutation acceptInv($userId:ID!, $groupId:ID!, $status:String!){
  acceptInvitation(UserID:$userId, GroupID:$groupId, Status:$status)
}
`

export const DELETE_INV = gql`
mutation declineInv($userId:ID!, $groupId:ID!){
  declineInvitation(UserID:$userId, GroupID:$groupId)
}
`

export const LEAVE_GROUP = gql`
mutation leaveGroup($userId:ID!, $groupId:ID!){
  leaveGroup(UserID:$userId, GroupID:$groupId)
}
`

export const CHECK_REQ_GROUP = gql`
query checkReqGroup($groupId:ID!){
  checkRequest(groupId:$groupId){
    id
    firstname
    surname
	}
}
`

export const SEND_REQ = gql`
mutation sendReq($userId:ID!, $groupId:ID!){
  sendRequest(UserID:$userId, GroupID:$groupId)
}
`

export const PROMOTE_ADMIN = gql`
mutation promoteAdmin($userId:ID!, $groupId:ID!){
  promoteMember(UserID:$userId, GroupID:$groupId)
}
`

export const CHANGE_COVER = gql`
mutation changeCover($groupId:ID!, $mediaUrl:String!){
  changeCoverPhoto(groupId:$groupId, mediaUrl:$mediaUrl)
}
`

export const LEAVE_GROUP_AS_ADMIN = gql`
mutation exitAsAdmin($groupId:ID!, $userId:ID!){
  exitGroupAdmin(UserID:$userId, GroupID:$groupId)
}
`

export const GET_USER_GROUP_POSTS = gql`
query getAllUserGroupPost($userId:ID!, $limit: Int!, $offset: Int!,){
  GetAllUserGroupPost(userId:$userId, limit:$limit, offset:$offset){
    FetchGroup{
      ID
      GroupName
      GroupPrivacy
      GroupDesc
      GroupBannerPic
      GroupCreated
      GroupMember{
        GroupMember{
          UserID
        }
        UserData{
          firstname
          surname
        }
      }
    }
    GroupPost{
      id
      contentText
      authorId
      postDate
      authorData{
        firstname
        surname
        id
      }
      likedCount
      mediaUrl
      postPrivacy
    } 
  }
}
`
export const DELETE_GROUP_POST = gql`
mutation deleteGroupPost($postId:ID!){
  deleteGroupPost(postId:$postId)
}
`

export const ADD_CHAT_GROUP_HEADER = gql`
mutation insertGroupChatHeader($groupId:ID!){
  createGroupChat(groupId:$groupId)
}
`

export const GET_ALL_GROUP_CONVO = gql`
query getGroupConvo($groupId:String!){
  getAllGroupConversation(groupId:$groupId){
    chatHeaderId
    chatHeaderInformation{
      id
      groupId
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
    senderData{
      id
      firstname
      surname
      profilepic
    }
  }
}
`

export const INSERT_CHAT_GROUP_DETAILS = gql`
mutation addGroupMsg($newChatGroupDetail:newChatGroupDetail!){
  createGroupMessage(inputChatDetail:$newChatGroupDetail)
}
`