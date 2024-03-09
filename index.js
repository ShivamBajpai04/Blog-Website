import express from "express";
import multer from "multer";
import fs from "fs";

const app = express();
const port = 3000;

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./public/images");
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + "img");
	},
});

const upload = multer({ storage: storage });

class Post {
	constructor(title, text, imageUrl) {
		this.title = title;
		this.text = text;
		this.imageUrl = imageUrl; // Store the image URL
		this.id = Post.incrementId();
	}
	static incrementId() {
		if (!this.latestId) this.latestId = 1;
		else this.latestId++;
		return this.latestId;
	}
}

const posts = [];

app.get("/", (req, res) => {
	res.render("home.ejs", { posts: posts });
});

app.get("/edit/:id", (req, res) => {
	
	const postId = parseInt(req.params.id, 10); // Parse postId from URL parameter

	// Find the post with the specified ID
	const postToEdit = posts.find((post) => post.id === postId);

	if (!postToEdit) {
		// Handle the case where the post is not found
		return res.status(404).send("Post not found.");
	}

	// Render the edit form with the post data
	res.render("edit.ejs", { post: postToEdit });
});

// View Post by ID
app.get("/view/:id", (req, res) => {
	const postId = parseInt(req.params.id, 10); // Parse postId from URL parameter

	// Find the post with the specified ID
	const postToView = posts.find((post) => post.id === postId);

	if (!postToView) {
		// Handle the case where the post is not found
		return res.status(404).send("Post not found.");
	}

	// Render the view page with the post data
	res.render("view.ejs", { post: postToView });
});

app.get("/new",(req,res) =>{
	res.render("new.ejs")
})

// Modify the /post route to handle image uploads
app.post("/post", upload.single("image"), (req, res) => {
	const title = req.body.title;
	const text = req.body.text;
	const imageUrl = req.file ? "/images/" + req.file.filename : null; // Save the image URL if available

	posts.splice(0,0,new Post(title, text, imageUrl));
	res.redirect("/");
});

app.post("/edit/:id", (req, res) => {
	const postId = parseInt(req.body.postId, 10); // Parse postId to an integer

	// Find the post with the specified ID
	const postToUpdate = posts.find((post) => post.id === postId);

	if (!postToUpdate) {
		// Handle the case where the post is not found
		return res.status(404).send("Post not found.");
	}

	// Update the post with the new data
	postToUpdate.title = req.body.title;
	postToUpdate.text = req.body.text;

	// Redirect to the home page or any other appropriate page after editing
	res.redirect("/");
});

app.post("/remove", (req, res) => {
	const postIdToRemove = req.body.postId;

	// Find the index of the post in the posts array
	const index = posts.findIndex((x) => x.id == postIdToRemove);

	// If the post is found, remove it from the array
	if (index !== -1) {
		if (posts[index].imageUrl) {
	
			fs.unlinkSync("./public"+posts[index].imageUrl);
		}
		posts.splice(index, 1);
	}

	// Redirect back to the home page
	res.redirect("/");
});

app.listen(port, () => {
	console.log(`listening on port ${port}`);
});
