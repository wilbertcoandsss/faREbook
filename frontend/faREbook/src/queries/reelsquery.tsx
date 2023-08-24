import { gql } from "@apollo/client";

export const INSERT_REELS = gql`
mutation insertReel($newReels: NewReels!) {
  insertReel(inputReel: $newReels) {
    Id
    UserID
    Caption
    ReelsDate
    FontColor
  }
}
`

export const GET_ALL_REELS = gql`
query getReels{
  getAllReels{
    Id
    UserID
    Caption
    ReelsDate
    FontColor
    LikedCount
    CommentCount
    MediaUrl
    AuthorData{
      id
      firstname
      surname
      profilepic
    }
  }
}
`

export const GET_REELS_BY_ID = gql`
query getReelsById($userId:ID!){
  getReelsByUserId(UserID:$userId){
    Id
    UserID
    Caption
    ReelsDate
    FontColor
    LikedCount
    CommentCount
    MediaUrl
    AuthorData{
      id
      firstname
      surname
      profilepic
    }
  }
}
`

export const LIKE_REELS = gql`
mutation likeReels($userId: ID!, $reelsId:ID!){
  likeReels(userID:$userId, reelsId:$reelsId)
}
`

export const UNLIKE_REELS = gql`
mutation unlikeReels($userId: ID!, $reelsId:ID!){
  unlikeReels(userID:$userId, reelsId:$reelsId)
}
`