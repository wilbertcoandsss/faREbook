import { gql } from '@apollo/client';

export const GET_USER = gql`
query{
  getAllUser {
    id
    name
    email
    username
    profilepic
  }
}
`

export const ADD_USERS = gql`
mutation CreateUser($inputUser:NewUser!){
  createUser(inputUser:$inputUser){
    id
    firstname
    surname
    email
    Dob
    verifcode
    isverified
    gender
    profilepic
  }
}
`

export const LOGIN_USER = gql`
mutation LoginUser($email: String!, $password: String!) {
  loginUser(input: { email: $email, password: $password }) {
    id
    email
    token
  }
}
`;

export const GET_EMAIL = gql`
query GetUserByEmail($email: String!) {
  getUserByEmail(email: $email) {
    id
    email
    firstname
  }
}
`

export const GET_USER_ID = gql`
query GetUser($id:ID!){
  getUser(id:$id) {
    id
    firstname
    surname
    email
    Dob
    verifcode
    isverified
    gender
    profilepic
  }
}`

export const SET_VERIFIED = gql`
mutation SetVerified($id:ID!){
  setVerified(id:$id){
    id
    firstname
    isverified
  }
}
`

export const CHECK_PW = gql`
mutation CheckPW($pw: String!, $id:ID!){
  checkPassword(pw:$pw, id:$id)
}
`

export const RESET_PW = gql`
mutation ResetPW($pw: String!, $id:ID!){
  resetPassword(newPw:$pw, id:$id)
}
`

export const GET_USER_BY_TOKEN = gql`
query ValidateJWT($token:String!){
  validateJWT(token:$token){
    id
    firstname
    surname
    email
    Dob
    verifcode
    isverified
    gender
    profilepic
  }
}
`

export const GET_ALL_USER = gql`
query GetAllUser{
  getAllUser{
    id
    firstname
    surname
    Dob
    gender
    profilepic
  }
}
`

export const GET_FRIEND_REQ = gql`
query getFriendReq($userId:ID!){
  getFriendRequest(UserID:$userId){
    UserID
    FriendsID
    Status
    UserData{
      firstname
      surname
      email
      profilepic
    }
    FriendsData{
      firstname
      surname
      email
      profilepic
    }
  }
}
`

export const GET_ALL_FRIENDS = gql`
query getAllFriends($userId:ID!){
  getAllFriends(UserId:$userId){
    UserID
    FriendsID
    Status
    UserData{
      firstname
      surname
      email
      profilepic
    }
    FriendsData{
      firstname
      surname
      email
      profilepic
    }
  }
}
`

export const DECLINE_FRIEND_REQ = gql`
mutation deleteReq($userId:ID!, $friendsId:ID!){
  declineReq(UserID:$userId, FriendsID:$friendsId)
}
`

export const ACC_REQ = gql`
mutation acceptReq($userId:ID!, $friendsId:ID!){
  acceptReq(UserID:$userId, FriendsID:$friendsId)
}
`
export const SUGGESTED_FRIENDS = gql`
query suggestedFriends($userId:ID!){
  getSuggestedFriends(UserID:$userId){
    id
    firstname
    surname
    email
    Dob
    profilepic
  }
}
`

export const MUTUAL_FRIENDS = gql`
query getMutual($userId1:ID!, $userId2:ID!){
  getMutualFriends(UserID1:$userId1, UserID2:$userId2)
}
`

export const REQ_FRIENDS = gql`
mutation ReqFriend($userId:ID!,$friendsId:ID!){
  requestFriends(UserID:$userId, FriendsID:$friendsId)
}
`

export const CHECK_VERIF = gql`
query checkVerif($email:String!){
  checkVerified(email:$email)
}
`