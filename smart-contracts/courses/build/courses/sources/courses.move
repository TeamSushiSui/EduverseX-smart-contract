/// Module: blockchain_basics
module courses::courses {
    use std::string::String;

    /// Structure representing a course
    public struct Course has key {
        id: UID,                       // Unique identifier for the course
        name: String,                  // Name of the course
        description: String,           // Description of the course
        category: String,              // Category of the course
        num_of_students: u64,          // Number of students enrolled in the course
        created_by: address,           // Address of the course creator
        students: vector<address>,     // List of student addresses enrolled in the course
        questions: vector<Question>,   // List of questions associated with the course
        revies: vector<Review>,        // List of reviews for the course (note: typo should be 'reviews')
        course_xp: u64,                // Experience points (XP) awarded for completing the course
        difficulty_level: u8,          // Difficulty level of the course (1-5 scale)
        image_url : String,            // URL of the image associated with the course
    }

    /// Structure representing a course review
    public struct Review has store, drop, copy {
        student: address,              // Address of the student providing the review
        rating: u8,                    // Rating (1-5 scale)
        review_text: String,  // review text provided by the student
    }

    /// Structure representing a course question
    public struct Question has store, drop, copy {
        text: String,                  // Text of the question
        correct_answer: String,        // Correct answer for the question
    }

    /// Function to create a new course
    public fun create_course(name: String, description: String, category : String, creator_address: address, xp: u64, difficulty_level: u8, image_url: String, ctx: &mut TxContext) {
        let course: Course = Course {
            id: object::new(ctx),                // Generate a unique ID for the course
            name,                                // Course name
            description,                         // Course description
            category,                            // Category of the course
            num_of_students: 0,                  // Initialize the number of students to 0
            created_by: creator_address,         // Creator's address
            students: vector::empty<address>(),  // Initialize an empty list of students
            questions: vector::empty<Question>(),// Initialize an empty list of questions
            revies: vector::empty<Review>(),     // Initialize an empty list of reviews (note: typo should be 'reviews')
            course_xp: xp,                       // XP awarded for the course
            difficulty_level,                    // Difficulty level of the course
            image_url,                           // URL of the image associated with the course
        };
        let sender: address = tx_context::sender(ctx);   // Get the sender's address
        transfer::transfer(course, sender);              // Transfer ownership of the course to the sender
    }

    /// Function to check if the given answer is correct for the question
    public fun check_correct_answer(course: &Course, question_text: String, answer: String): bool {
        let i = find_question_index(course, question_text);      // Find the index of the question
        vector::borrow(&course.questions, i).correct_answer == answer // Check if the answer is correct
    }

    /// Function to add a question to the course
    public fun add_question(course: &mut Course, question_text: String, correct_answer: String) {
        let question = Question {
            text: question_text,         // Question text
            correct_answer,              // Correct answer
        };
        vector::push_back(&mut course.questions, question);  // Add the question to the course
    }

    /// Function to remove a question from the course
    public fun remove_question(course: &mut Course, question_text: String) {
        let i = find_question_index(course, question_text);      // Find the index of the question
        vector::remove(&mut course.questions, i);                // Remove the question from the course
    }

    /// Helper function to find the index of a question by its text
    fun find_question_index(course: &Course, question_text: String): u64 {
        let len = vector::length(&course.questions);             // Get the number of questions
        let mut i = 0;
        while (i < len) {
            if (vector::borrow(&course.questions, i).text == question_text) {  // Find the question by its text
                return i
            };
            i = i + 1;
        };
        abort(1)  // Abort if the question is not found
    }

    /// Function to view all questions in a course
    public fun view_questions(course: &Course): vector<Question> {
        course.questions   // Return the list of questions
    }

    /// Function to update the course name
    public fun update_course_name(course: &mut Course, new_name: String) {
        course.name = new_name;  // Update the course name
    }

    /// Function to update the course description
    public fun update_course_description(course: &mut Course, new_description: String) {
        course.description = new_description;  // Update the course description
    }

    /// Function to update the XP awarded for the course
    public fun update_course_xp(course: &mut Course, new_xp: u64) {
        course.course_xp = new_xp;  // Update the course XP
    }

    /// Function to update the course difficulty level
    public fun update_course_difficulty_level(course: &mut Course, new_difficulty_level: u8) {
        course.difficulty_level = new_difficulty_level;  // Update the course difficulty level
    }

    public fun update_course_image_url(course: &mut Course, url: String) {
        course.image_url = url;
    }

    /// Function to enroll a student in the course
    public fun enroll_student(course: &mut Course, student_address: address) {
        vector::push_back(&mut course.students, student_address); // Add the student to the course
        course.num_of_students = course.num_of_students + 1;      // Increment the number of students
    }

    /// Function to unenroll a student from the course
    public fun unenroll_student(course: &mut Course, student_address: address) {
        let i = find_student_index(course, student_address);       // Find the index of the student
        vector::remove(&mut course.students, i);                   // Remove the student from the course
        course.num_of_students = course.num_of_students - 1;       // Decrement the number of students
    }

    /// Helper function to find the index of a student by their address
    fun find_student_index(course: &Course, student_address: address): u64 {
        let len = vector::length(&course.students);                // Get the number of students
        let mut i = 0;
        while (i < len) {
            if (vector::borrow(&course.students, i) == &student_address) {  // Find the student by their address
                return i
            };
            i = i + 1;
        };
        abort(1)  // Abort if the student is not found
    }

    /// Function to view course details
    public fun view_course(course: &Course): (String, String, String, u8, u64, String, u64, address, vector<address>) {
        (course.name, course.description, course.category, course.difficulty_level, course.course_xp, course.image_url, course.num_of_students, course.created_by, course.students)  // Return course details
    }

    /// Function to add a review for the course
    public fun add_review(course: &mut Course, student_address: address, rating: u8, review_text: String) {
        let review = Review {
            student: student_address,  // Student providing the review
            rating,                    // Rating given by the student
            review_text,               // review text
        };
        vector::push_back(&mut course.revies, review);  // Add the review to the course (note: typo should be 'reviews')
    }

    public fun view_reviews(course: &Course): vector<Review> {
        course.revies  // Return the list of reviews
    }
}

