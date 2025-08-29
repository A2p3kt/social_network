from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='followers',
        blank=True
    )
    
    def __str__(self):
        return self.username

    def is_following(self, user):
        if user == self:
            return None
        return self.following.filter(id=user.id).exists()

    def toggle_following(self, user):
        if user == self:
            return

        if self.is_following(user):
            self.following.remove(user)
            return False
        self.following.add(user)
        return True

    @property
    def followers_count(self):
        return self.followers.count()

    @property
    def following_count(self):
        return self.following.count()

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "followers": self.followers_count,
            "following": self.following_count,
            "posts": [post.serialize() for post in self.posts.all().order_by('-timestamp')]
        }


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def is_liked(self, user):
        return self.likes.filter(id=user.id).exists()

    def toggle_like(self, user):
        if self.is_liked(user):
            self.likes.remove(user)
            return False
        self.likes.add(user)
        return True

    @property
    def like_count(self):
        return self.likes.count()
    
    def __str__(self):
        return self.content

    def serialize(self):
        return {
            "id": self.id,
            "author": {"id": self.author.id,
                       "username": self.author.username},
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.like_count,
            "comments": [comment.serialize() for comment in self.comments.all().order_by('-timestamp')]
        }

# Just for future functionality
class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.content

    def serialize(self):
        return {
            "id": self.id,
            "author": {"id": self.author.id,
                       "username": self.author.username},
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p")
        }
