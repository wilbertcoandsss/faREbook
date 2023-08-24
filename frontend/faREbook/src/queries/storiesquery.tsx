import { gql } from '@apollo/client';

export const INSERT_STORIES = gql`
mutation insertStories($newStories:NewStories!){
    insertStories(newStories:$newStories){
      ID
      UserID
      Type
      BgColor
      FontFamily
      FontColor
      TextContent
      ZoomLevel
    }
  }
`

export const GET_ALL_STORIES = gql`
query getAllStories{
  getAllStories{
    ID
    UserID
    Type
    BgColor
    FontFamily
    FontColor
    TextContent
    MediaUrl
    Date
    ZoomLevel
    AuthorData{
      id
      firstname
      surname
    }
  }
}
`

export const GET_STORIES_BY_USER_ID = gql`
query getStoriesByUserId($userId:ID!){
  getStoriesByUserId(userId: $userId){
    ID
    UserID
    Type
    BgColor
    FontFamily
    FontColor
    TextContent
    MediaUrl
    Date
    ZoomLevel
    AuthorData{
      id
      firstname
      surname
    }
  }
}
`