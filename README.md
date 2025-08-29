# Social Network Project

This project is a **dynamic social networking web application** built with **Django**, **Bootstrap 4**, and **vanilla JavaScript**. The app allows users to create accounts, post content, follow other users, like posts, and comment, creating a rich, interactive social experience.

The project was inspired by **CS50W (Web Programming with Python and JavaScript)** and has been expanded to include custom features and improved user interaction.

---

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Components](#components)
- [User Authentication](#user-authentication)
- [Posts and Comments](#posts-and-comments)
- [Profiles and Following](#profiles-and-following)
- [Likes](#likes)
- [Pagination](#pagination)
- [Admin Interface](#admin-interface)
- [Responsive Design](#responsive-design)
- [Setup and Installation](#setup-and-installation)
- [Acknowledgments](#acknowledgments)

---

## Features

- User registration, login, and logout
- Create new posts with rich text content
- View all posts or posts from users you follow
- Like and unlike posts
- Comment on posts
- Follow and unfollow other users
- Edit your own posts
- Pagination for posts
- Fully responsive layout using Bootstrap
- Real-time updates via AJAX calls without page reloads

---

## Technologies Used

- **Backend:** Django, Python
- **Frontend:** HTML, CSS, Bootstrap 4, JavaScript
- **Database:** SQLite (default for Django, easily changeable to PostgreSQL)
- **Authentication:** Django built-in authentication system
- **AJAX:** Fetch API for asynchronous interactions

---

## Project Structure

``` bash
project4/
├── network/
│   ├── migrations/
│   ├── static/network/
│   │   ├── JS/index.js
│   │   └── CSS/styles.css
│   ├── templates/network/
│   │   ├── index.html
│   │   ├── layout.html
│   │   ├── login.html
│   │   └── register.html
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── tests.py
│   ├── urls.py
│   └── views.py
├── project4/
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── db.sqlite3
├── manage.py
├── requirments.txt
└── README.md
```

---

## Components

### Models

1. **User (Custom User Model)**

   - Extends Django’s `AbstractUser`
   - Adds a **following** relationship (ManyToManyField)
   - Helper methods:

     - `is_following(user)`
     - `toggle_following(user)`
     - `followers_count` and `following_count`

2. **Post**

   - Author: ForeignKey to User
   - Content: TextField
   - Likes: ManyToManyField to User
   - Timestamp: auto-added
   - Helper methods:

     - `is_liked(user)`
     - `toggle_like(user)`
     - `like_count`

3. **Comment**

   - Author: ForeignKey to User (nullable)
   - Post: ForeignKey to Post
   - Content: TextField
   - Timestamp: auto-added

---

### Views (Backend Logic)

- **index:** Renders the homepage
- **login_view / logout_view / register:** Handle authentication
- **new_post:** Create new posts (AJAX POST)
- **get_posts:** Fetch posts based on view (`all`, `following`, or specific user) with pagination
- **view_profile:** Return profile info and handle follow/unfollow
- **like_post:** Toggle likes for posts
- **edit_post:** Edit a user’s own post
- **comment:** Add a comment to a post

---

### Frontend (JavaScript)

- Handles **dynamic page updates without reloading**:

  - Loading posts and comments asynchronously
  - Handling likes, follows, comments, and edits
  - Pagination (`previous` and `next`)

- Uses **event delegation** to handle buttons dynamically
- Updates the DOM efficiently:

  - Shows/hides post creation form based on current view
  - Renders posts, likes, comments, and profile info dynamically

- Maintains global state:

  - `current_page` and `current_view` for pagination

---

### Templates

- **layout.html:** Base layout with navbar, Bootstrap styling, and blocks for page content
- **index.html:** Homepage template:

  - Post creation form
  - Post feed
  - Profile container
  - Pagination controls

---

## User Authentication

- **Registration:** Validates password confirmation and unique username
- **Login:** Authenticates users using Django’s built-in system
- **Logout:** Ends user session
- **Login-required endpoints:** Creating posts, liking, commenting, editing

---

## Posts and Comments

- Users can create posts using a **textarea form**
- Posts show:

  - Author’s username and avatar (first letter of username)
  - Post content
  - Timestamp
  - Likes
  - Comments

- Comments are **nested under posts** with username, content, and timestamp
- Only signed-in users can comment

---

## Profiles and Following

- Clicking a username displays their profile
- Shows followers and following counts
- Follow/unfollow button toggles dynamically
- Users cannot follow themselves

---

## Likes

- Clicking the heart icon toggles like/unlike
- Likes count updates dynamically
- Users cannot like posts if not signed in

---

## Pagination

- **10 posts per page**
- “Previous” and “Next” buttons enabled/disabled dynamically
- Current page number displayed as `X of Y`

---

## Admin Interface

- **Custom admin classes** for `User`, `Post`, and `Comment`
- Displays followers, following, content previews, likes, and timestamps
- Filters and search enabled for content and authors
- Makes admin management intuitive and efficient

---

## Responsive Design

- Built using **Bootstrap 4 grid system**
- Fully mobile-friendly:

  - Navbar collapses on small screens
  - Post feed and profile sections adapt to screen size
  - Forms and buttons are touch-friendly

---

## Setup and Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/social-network.git
cd social-network
```

2. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Apply migrations:

```bash
python manage.py migrate
```

5. Create a superuser (for admin access):

```bash
python manage.py createsuperuser
```

6. Run the development server:

```bash
python manage.py runserver
```

7. Access the app at `http://127.0.0.1:8000/`

---

## Acknowledgments

- Inspired by **CS50W Web Programming with Python and JavaScript**
- Expanded features including:

  - Full post CRUD operations
  - AJAX-powered likes and comments
  - Responsive, dynamic frontend
  - Pagination and profile views

---

This project demonstrates how to **combine Django backend with vanilla JS for interactive web applications**, providing a strong foundation for full-stack web development.
