import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator

from .models import User, Post, Comment


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@login_required
def new_post(request):
    # A new post must be a POST request
    if request.method != 'POST':
        return JsonResponse({"error": "POST request is required."}, status=400)

    data = json.loads(request.body)

    # Ensure that a post was submitted
    content = data.get("content").strip()

    if content == "":
        return JsonResponse({"error": "Post cannot be empty."}, status=400)

    post = Post(
        author=request.user,
        content=content
    )

    post.save()
    return JsonResponse({"message": "Post successfully uploaded."}, status=201)


def get_posts(request, view):
    user = request.user
    if view == "all":
        posts = Post.objects.all()
    elif view == "following":
        posts = Post.objects.filter(author__in=user.following.all())
    else:
        try:
            profile_id = int(view)
        except ValueError:
            return JsonResponse({"error": "Not a valid post view."}, status=400)
        try:
            profile = User.objects.get(pk=profile_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "User does not exist."}, status=400)
        posts = Post.objects.filter(author=profile)
    # Order posts in reverse chronological order
    posts = posts.order_by("-timestamp").all()

    # Get page number from query params (default to 1)
    page_number = request.GET.get('page', 1)

    # Paginate posts
    paginator = Paginator(posts, 10)  # 10 posts per page
    # Confirm that the page is a valid one
    n = int(page_number)
    if n > paginator.num_pages or n < 0:
        return JsonResponse({"error": "Not a valid page."}, status=404)

    page_obj = paginator.get_page(page_number)

    posts_dict = []
    for post in page_obj:
        p = post.serialize()
        p["is_authenticated"] = user.is_authenticated
        if user.is_authenticated:
            p["is_liked"] = post.is_liked(request.user)
            p["can_edit"] = request.user == post.author
        else:
            p["is_liked"] = False
            p["can_edit"] = False

        posts_dict.append(p)

    return JsonResponse({
        "posts": posts_dict,
        "has_next": page_obj.has_next(),
        "has_previous": page_obj.has_previous(),
        "num_pages": paginator.num_pages,
        "current_page": page_obj.number,
    })


def view_profile(request, user_id):
    try:
        profile_user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "This user does not exist"}, status=404)

    if request.method == 'POST':
        if request.user.is_authenticated:
            outcome = request.user.toggle_following(profile_user)
            action = "followed" if outcome else "unfollowed"
            return JsonResponse({"message": f"Successfully {action}"})
        else:
            return JsonResponse({"error": "You can't follow a user if you are not signed in"}, status=403)

    data = profile_user.serialize()

    if request.user.is_authenticated:
        data['is_following'] = request.user.is_following(profile_user)
    else:
        data['is_following'] = None

    return JsonResponse(data, safe=False)


@login_required
def like_post(request, post_id):
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "This post does not exist"}, status=404)

    if request.user.is_authenticated:
        outcome = post.toggle_like(request.user)
        action = "liked" if outcome else "unliked"
        return JsonResponse({"message": f"Successfully {action}"})
    else:
        return JsonResponse({"error": "You can't like a post if you are not signed in"}, status=403)


@login_required
def edit_post(request, post_id):
    if request.method == 'PUT':
        try:
            post = Post.objects.get(pk=post_id)
            if request.user != post.author:
                return JsonResponse({"error": "You cannot edit someone else's post"}, status=403)

            data = json.loads(request.body)

            # Ensure that a post was submitted
            content = data.get("content").strip()

            if content == "":
                return JsonResponse({"error": "Post cannot be empty."}, status=400)

            post.content = content
            post.save()
            return JsonResponse({'message': 'Post updated successfully'})
        except Post.DoesNotExist:
            return JsonResponse({"error": "The post doesn't exist"}, status=404)

    return JsonResponse({"error": "Must be a PUT request"}, status=400)


@login_required
def comment(request, post_id):
    if request.method == 'POST':
        try:
            post = Post.objects.get(pk=post_id)
            
            data = json.loads(request.body)
            content = data.get("content").strip()
            
            if not content:
                return JsonResponse({"error": "A comment cannot be empty"}, status=400)
            
            cmnt = Comment(
                author=request.user,
                post=post,
                content=content
            )
            
            cmnt.save()
            return JsonResponse({"message": "Comment was successfully added"}, status=201)
        except Post.DoesNotExist:
            return JsonResponse({"error": "The post does not exist"}, status=404)
    return JsonResponse({"error": "Must be a post request"}, status=400)
