import { gql } from '@apollo/client';

export const GET_ALL_POST = gql`
query getPosts($limit: Int!, $offset: Int!) {
  getAllPost(limit: $limit, offset: $offset) {
    id
    contentText
    authorId
    postDate
    postPrivacy
    authorData {
      id
      firstname
      surname
      profilepic
      Dob
    }
    likedCount
    mediaUrl
    commentCount
    taggedUser{
      id
      firstname
      surname
      profilepic
    }
  }
}
`

export const GET_ALL_POST_WITHOUT_LIMIT = gql`
query getPostsWithoutLimit($limit: Int!, $offset: Int!) {
  getAllPostWithoutLimit(limit:$limit, offset:$offset) {
    id
    contentText
    authorId
    postDate
    postPrivacy
    authorData {
      id
      firstname
      surname
      profilepic
    }
    likedCount
    mediaUrl
    commentCount
  }
}
`

export const ADD_POST = gql`
mutation InsertPost($inputPost: NewPostInput!){
  insertPost(inputPost: $inputPost){
    id
    contentText
    authorId
    postDate
    postPrivacy
  }
}
`

export const LIKE_POST = gql`
mutation likePost($userId: ID!, $postId:ID!){
  likePost(userID:$userId, postID:$postId)
}
`

export const UNLIKE_POST = gql`
mutation unlikePost($userId:ID!, $postId:ID!){
  unlikePost(userID:$userId, postID:$postId)
}
`

export const LIKE_COMMENT = gql`
mutation likeComment($userId: ID!, $commentId:ID!){
  likeComment(commentId:$commentId, userID: $userId)
}
`
export const UNLIKE_COMMENT = gql`
mutation unlikeComment($userId: ID!, $commentId:ID!){
  unlikeComment(commentId:$commentId, userID: $userId)
}
`

export const ADD_COMMENT = gql`
mutation addComment($postId:ID!, $userId:ID!, $comment:String!, $date: String!){
  addComment(postID:$postId, userID:$userId, comment:$comment, date:$date){
    ID
    PostID
    UserID
    Comment
    Date
  }
}
`

export const REPLY_COMMENT = gql`
mutation addReplies($commentId:ID!, $userId:ID!, $reply:String!, $date: String!){
  addReplies(commentId:$commentId, userID:$userId, reply:$reply, date:$date){
    ID
    CommentID
    UserID
    Reply
    Date
  }
}
`

export const GET_ALL_REPLIES = gql`
query getReplies($commentId:ID!){
  getAllReplies(commentId: $commentId){
    ID
    UserID
    Reply
    Date
    LikedCount
    UserData{
      id
      firstname
      surname
      profilepic
    }
    AncestorData{
      id
      firstname
      surname
    }
  }
}
`

export const GET_COMMENTS = gql`
query getComments($postId: ID!){
  getAllComments(postID:$postId){
    ID
    PostID
    UserID
    Comment
    LikedCount
    UserData{
      id
      firstname
      surname
      profilepic
    }
    Date
    RepliesCount
  }
}
`

export const GET_LIKE_STATUS = gql`
query getLikeStatus($postId:ID!, $userId:ID!){
  getLikeStatus(postID:$postId, userID:$userId)
}
`

export const INSERT_MEDIA = gql`
mutation InsertMedia($postId: ID!, $mediaUrls: [String!]!) {
  insertMedia(postId: $postId, mediaUrl: $mediaUrls) {
    postId
    mediaUrl
  }
}
`

export const INSERT_TAG = gql`
mutation insertTagged($userId:ID!, $postId:ID!){
  insertTaggedUser(postId:$postId, userId:$userId)
}
`