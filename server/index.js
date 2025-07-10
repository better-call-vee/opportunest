require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const admin = require("firebase-admin");
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 5000;

// --- Middleware ---
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://opportunest9.web.app',
    'https://opportunest9.firebaseapp.com',
];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// --- Multer setup ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Firebase Admin SDK Initialization ---
try {
    const serviceAccountString = Buffer.from(process.env.FB_SERVICE_KEY, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(serviceAccountString);
    if (admin.apps.length === 0) {
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        console.log('✅ Firebase Admin SDK initialized successfully.');
    }
} catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error.message);
    process.exit(1);
}

const client = new MongoClient(process.env.MONGO_URI, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function main() {
    try {
        // --- STEP 1: Connect to DB FIRST ---
        await client.connect();
        console.log("✅ Successfully connected to MongoDB!");

        // --- STEP 2: Define all collections ---
        const db = client.db('scholarshipDB');
        const usersCollection = db.collection('users');
        const scholarshipsCollection = db.collection('scholarships');
        const applicationsCollection = db.collection('applications');
        const reviewsCollection = db.collection('reviews');

        // --- STEP 3: Define all middleware and helper functions ---
        const verifyFirebaseToken = async (req, res, next) => {
            const authHeader = req.headers?.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).send({ success: false, message: 'Unauthorized' });
            }
            const token = authHeader.split(' ')[1];
            try {
                req.decoded = await admin.auth().verifyIdToken(token);
                next();
            } catch (error) {
                res.status(403).send({ success: false, message: 'Forbidden' });
            }
        };

        const verifyModerator = async (req, res, next) => {
            const user = await usersCollection.findOne({ email: req.decoded.email });
            if (user?.role === 'moderator' || user?.role === 'admin') next();
            else res.status(403).send({ success: false, message: 'Requires moderator role' });
        };

        const verifyAdmin = async (req, res, next) => {
            const user = await usersCollection.findOne({ email: req.decoded.email });
            if (user?.role === 'admin') next();
            else res.status(403).send({ success: false, message: 'Requires admin role' });
        };

        const ensureUserInDb = async (firebaseUser) => {
            if (!firebaseUser || !firebaseUser.email) return null;
            let userRole = 'user';
            if (firebaseUser.email === process.env.ADMIN_EMAIL) userRole = 'admin';
            else if (firebaseUser.email === process.env.MODERATOR_EMAIL) userRole = 'moderator';

            const query = { email: firebaseUser.email };
            const update = {
                $setOnInsert: { firebaseUid: firebaseUser.uid, email: firebaseUser.email, createdAt: new Date() },
                $set: { name: firebaseUser.name || 'N/A', photoURL: firebaseUser.picture || null, lastLogin: new Date(), role: userRole }
            };
            return await usersCollection.findOneAndUpdate(query, update, { upsert: true, returnDocument: 'after' });
        };

        // --- STEP 4: Define ALL API ROUTES ---

        app.get('/', (req, res) => res.send('🚀 Server is running!'));

        app.post('/sync-user', verifyFirebaseToken, async (req, res) => {
            const dbUser = await ensureUserInDb(req.decoded);
            res.send({ success: true, user: dbUser });
        });

        app.post('/upload-image', verifyFirebaseToken, upload.single('image'), async (req, res) => {
            try {
                if (!req.file) return res.status(400).send({ success: false, message: 'No image file provided.' });
                const body = new URLSearchParams();
                body.append('image', req.file.buffer.toString('base64'));
                const response = await axios.post(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, body);
                if (response.data.success) {
                    res.send({ success: true, data: { display_url: response.data.data.display_url } });
                } else {
                    throw new Error(response.data.error.message || 'ImgBB upload failed');
                }
            } catch (error) {
                console.error("POST /upload-image Error:", error.message);
                res.status(500).send({ success: false, message: 'Image upload failed on the server.' });
            }
        });

        // Scholarship Routes
        app.post('/scholarships', verifyFirebaseToken, verifyModerator, async (req, res) => {
            const scholarshipData = { ...req.body, postDate: new Date(), postedUserEmail: req.decoded.email };
            const result = await scholarshipsCollection.insertOne(scholarshipData);
            res.status(201).send({ success: true, insertedId: result.insertedId });
        });

        app.get('/scholarships-admin', verifyFirebaseToken, verifyModerator, async (req, res) => {
            const scholarships = await scholarshipsCollection.find({}).toArray();
            res.send({ success: true, data: scholarships });
        });

        app.patch('/scholarships/:id', verifyFirebaseToken, verifyModerator, async (req, res) => {
            const updatedData = req.body;
            delete updatedData._id;
            const result = await scholarshipsCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: updatedData });
            res.send({ success: result.modifiedCount > 0 });
        });

        app.delete('/scholarships/:id', verifyFirebaseToken, verifyModerator, async (req, res) => {
            const result = await scholarshipsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
            res.send({ success: result.deletedCount > 0 });
        });

        app.get('/scholarships-top', async (req, res) => {
            const topScholarships = await scholarshipsCollection.find({}).sort({ applicationFees: 1, postDate: -1 }).limit(6).toArray();
            res.send({ success: true, data: topScholarships });
        });

        app.get('/scholarships', async (req, res) => {
            const { search = '' } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 6;
            const skip = (page - 1) * limit;
            const searchQuery = search ? { $or: [{ scholarshipName: { $regex: search, $options: 'i' } }, { universityName: { $regex: search, $options: 'i' } }, { degree: { $regex: search, $options: 'i' } }] } : {};
            const total = await scholarshipsCollection.countDocuments(searchQuery);
            const data = await scholarshipsCollection.find(searchQuery).skip(skip).limit(limit).toArray();
            res.send({ success: true, total, data });
        });

        app.get('/scholarships/:id', async (req, res) => {
            const scholarship = await scholarshipsCollection.findOne({ _id: new ObjectId(req.params.id) });
            res.send({ success: !!scholarship, data: scholarship });
        });

        // Review Routes
        app.get('/reviews/:scholarshipId', async (req, res) => {
            const reviews = await reviewsCollection.find({ scholarship_id: new ObjectId(req.params.scholarshipId) }).toArray();
            res.send({ success: true, data: reviews });
        });

        app.post('/reviews', verifyFirebaseToken, async (req, res) => {
            const reviewData = { ...req.body, reviewerEmail: req.decoded.email, reviewerName: req.decoded.name, reviewerImage: req.decoded.picture || null, reviewDate: new Date(), scholarship_id: new ObjectId(req.body.scholarship_id) };
            const result = await reviewsCollection.insertOne(reviewData);
            res.status(201).send({ success: true, insertedId: result.insertedId });
        });

        app.get('/my-reviews', verifyFirebaseToken, async (req, res) => {
            const reviews = await reviewsCollection.find({ reviewerEmail: req.decoded.email }).toArray();
            res.send({ success: true, data: reviews });
        });

        app.patch('/reviews/:id', verifyFirebaseToken, async (req, res) => {
            const { ratingPoint, reviewerComments } = req.body;
            const filter = { _id: new ObjectId(req.params.id), reviewerEmail: req.decoded.email };
            const updateDoc = { $set: { ratingPoint: parseInt(ratingPoint, 10), reviewerComments, reviewDate: new Date() } };
            const result = await reviewsCollection.updateOne(filter, updateDoc);
            res.send({ success: result.modifiedCount > 0 });
        });

        app.delete('/reviews/:id', verifyFirebaseToken, async (req, res) => {
            const filter = { _id: new ObjectId(req.params.id), reviewerEmail: req.decoded.email };
            const result = await reviewsCollection.deleteOne(filter);
            res.send({ success: result.deletedCount > 0 });
        });

        // Application Routes
        app.post('/applications', verifyFirebaseToken, async (req, res) => {
            const applicationData = { ...req.body, scholarshipId: new ObjectId(req.body.scholarshipId), applicantEmail: req.decoded.email, applicationDate: new Date(), status: 'pending' };
            const result = await applicationsCollection.insertOne(applicationData);
            res.status(201).send({ success: true, insertedId: result.insertedId });
        });

        app.get('/my-applications', verifyFirebaseToken, async (req, res) => {
            const pipeline = [
                { $match: { applicantEmail: req.decoded.email } },
                { $lookup: { from: 'scholarships', localField: 'scholarshipId', foreignField: '_id', as: 'scholarshipDetails' } },
                { $unwind: '$scholarshipDetails' },
                { $project: { _id: 1, applicationStatus: '$status', feedback: '$feedback', appliedDegree: '$applyingDegree', universityName: '$scholarshipDetails.universityName', scholarshipName: '$scholarshipDetails.scholarshipName', universityAddress: { $concat: ['$scholarshipDetails.universityCity', ', ', '$scholarshipDetails.universityCountry'] }, subjectCategory: '$scholarshipDetails.subjectCategory', applicationFees: '$scholarshipDetails.applicationFees', serviceCharge: '$scholarshipDetails.serviceCharge', scholarshipId: '$scholarshipDetails._id' } }
            ];
            const applications = await applicationsCollection.aggregate(pipeline).toArray();
            res.send({ success: true, data: applications });
        });

        app.delete('/applications/:id', verifyFirebaseToken, async (req, res) => {
            const result = await applicationsCollection.deleteOne({ _id: new ObjectId(req.params.id), applicantEmail: req.decoded.email });
            res.send({ success: result.deletedCount > 0 });
        });

        app.patch('/applications/:id', verifyFirebaseToken, async (req, res) => {
            const updatedData = req.body;
            delete updatedData._id;
            delete updatedData.applicantEmail;
            delete updatedData.scholarshipId;
            const filter = { _id: new ObjectId(req.params.id), applicantEmail: req.decoded.email };
            const updateDoc = { $set: updatedData };
            const result = await applicationsCollection.updateOne(filter, updateDoc);
            res.send({ success: result.modifiedCount > 0 });
        });

        // --- Admin & Moderator Routes ---
        app.get('/admin/applications', verifyFirebaseToken, verifyModerator, async (req, res) => {
            const pipeline = [
                { $lookup: { from: 'scholarships', localField: 'scholarshipId', foreignField: '_id', as: 'scholarshipDetails' } },
                { $unwind: '$scholarshipDetails' },
                { $project: { applicantName: 1, applicantEmail: 1, applyingDegree: 1, universityName: '$scholarshipDetails.universityName', scholarshipName: '$scholarshipDetails.scholarshipName', status: 1, feedback: 1 } }
            ];
            const applications = await applicationsCollection.aggregate(pipeline).toArray();
            res.send({ success: true, data: applications });
        });

        app.patch('/admin/applications/:id/status', verifyFirebaseToken, verifyModerator, async (req, res) => {
            const result = await applicationsCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status: req.body.status } });
            res.send({ success: result.modifiedCount > 0 });
        });

        app.patch('/admin/applications/:id/feedback', verifyFirebaseToken, verifyModerator, async (req, res) => {
            const result = await applicationsCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { feedback: req.body.feedback } });
            res.send({ success: result.modifiedCount > 0 });
        });

        app.get('/admin/reviews', verifyFirebaseToken, verifyModerator, async (req, res) => {
            const pipeline = [
                { $lookup: { from: 'scholarships', localField: 'scholarship_id', foreignField: '_id', as: 'scholarshipDetails' } },
                { $unwind: '$scholarshipDetails' },
                { $project: { reviewerName: 1, reviewerEmail: 1, reviewerImage: 1, reviewDate: 1, ratingPoint: 1, reviewerComments: 1, universityName: '$scholarshipDetails.universityName', subjectCategory: '$scholarshipDetails.subjectCategory' } }
            ];
            const reviews = await reviewsCollection.aggregate(pipeline).toArray();
            res.send({ success: true, data: reviews });
        });

        app.delete('/admin/reviews/:id', verifyFirebaseToken, verifyModerator, async (req, res) => {
            const result = await reviewsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
            res.send({ success: result.deletedCount > 0 });
        });

        app.get('/admin/users', verifyFirebaseToken, verifyAdmin, async (req, res) => {
            const { role } = req.query;
            const filter = role ? { role } : {};
            const users = await usersCollection.find(filter).toArray();
            res.send({ success: true, data: users });
        });

        app.patch('/admin/users/:id/role', verifyFirebaseToken, verifyAdmin, async (req, res) => {
            const result = await usersCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { role: req.body.newRole } });
            res.send({ success: result.modifiedCount > 0 });
        });

        app.delete('/admin/users/:id', verifyFirebaseToken, verifyAdmin, async (req, res) => {
            const userToDelete = await usersCollection.findOne({ _id: new ObjectId(req.params.id) });
            if (userToDelete.email === req.decoded.email) {
                return res.status(400).send({ success: false, message: "Admin cannot delete their own account." });
            }
            const result = await usersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
            res.send({ success: result.deletedCount > 0 });
        });

        app.get('/admin/stats', verifyFirebaseToken, verifyAdmin, async (req, res) => {
            const totalUsers = await usersCollection.countDocuments();
            const totalScholarships = await scholarshipsCollection.countDocuments();
            const totalApplications = await applicationsCollection.countDocuments();
            const categoryPipeline = [{ $group: { _id: "$scholarshipCategory", count: { $sum: 1 } } }, { $project: { name: "$_id", value: "$count", _id: 0 } }];
            const categoryStats = await scholarshipsCollection.aggregate(categoryPipeline).toArray();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const applicationPipeline = [{ $match: { applicationDate: { $gte: sevenDaysAgo } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$applicationDate" } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }, { $project: { date: "$_id", applications: "$count", _id: 0 } }];
            const applicationStats = await applicationsCollection.aggregate(applicationPipeline).toArray();
            res.send({ success: true, data: { totalUsers, totalScholarships, totalApplications, categoryStats, applicationStats } });
        });

        console.log("👍 Express app routes configured.");

        // --- STEP 5: Start the server ONLY AFTER everything above is ready ---
        app.listen(port, () => {
            console.log(`🚀 Server is listening on port ${port}`);
        });

    } catch (err) {
        console.error("❌ CRITICAL: Could not connect to MongoDB. Server not started.", err);
        process.exit(1);
    }
}

// Run the main function to start the entire application
main();