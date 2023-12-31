package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.36

import (
	"context"

	"github.com/google/uuid"
	"github.com/wilbertcoandssss/training-preweb/graph/model"
)

// AddComment is the resolver for the addComment field.
func (r *mutationResolver) AddComment(ctx context.Context, postID string, userID string, comment string, date string) (*model.Comment, error) {
	newComment := &model.Comment{
		ID:      uuid.NewString(),
		PostID:  postID,
		UserID:  userID,
		Comment: comment,
		Date:    date,
	}

	return newComment, r.DB.Save(&newComment).Error
}

// GetAllComments is the resolver for the getAllComments field.
func (r *queryResolver) GetAllComments(ctx context.Context, postID string) ([]*model.FetchComment, error) {
	var comments []*model.Comment

	if err := r.DB.Where("post_id = ?", postID).Find(&comments).Error; err != nil {
		return nil, err
	}

	var fetchComments []*model.FetchComment

	for _, comment := range comments {
		fetchComment := &model.FetchComment{
			ID:           comment.ID,
			PostID:       comment.PostID,
			UserID:       comment.UserID,
			Comment:      comment.Comment,
			LikedCount:   0,
			UserData:     nil,
			Date:         comment.Date,
			RepliesCount: 0,
		}

		var user model.User

		if err := r.DB.Where("id = ?", comment.UserID).First(&user).Error; err != nil {
			return nil, err
		}

		fetchComment.UserData = &user

		var likeCount int64
		if err := r.DB.Model(&model.Like{}).Where("post_id = ?", comment.ID).Count(&likeCount).Error; err != nil {
			return nil, err
		}

		fetchComment.LikedCount = int(likeCount)

		var likeCount2 int64
		if err := r.DB.Model(&model.Replies{}).Where("comment_id = ?", comment.ID).Count(&likeCount2).Error; err != nil {
			return nil, err
		}

		fetchComment.RepliesCount = int(likeCount2)

		fetchComments = append(fetchComments, fetchComment)
	}

	return fetchComments, nil
}
