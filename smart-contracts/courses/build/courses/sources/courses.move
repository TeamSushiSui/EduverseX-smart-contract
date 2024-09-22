/// Module: blockchain_basics
module courses::courses {
    use std::string::String;
    public struct Course has key {
        id : UID,
        name : String,
        description : String,
        num_of_students : u64,
        created_by : address,
        students: vector<address>,
        questions: vector<Question>,
        revies : vector<Review>,
        course_xp: u64,
        difficulty_level: u8,
    }

    public struct Review has store, drop {
        student: address,
        rating: u8, // 1-5 scale
        review_text: option::Option<String>,
    }

    public struct Question has store, drop, copy {
        text: String,
        correct_answer: String,
    }

    public fun create_course(name: String, description: String, creator_address: address, xp: u64, difficulty_level: u8, ctx: &mut TxContext){
        let course : Course = Course {
            id : object::new(ctx),
            name,
            description,
            num_of_students: 0,
            created_by: creator_address,
            students: vector::empty<address>(),
            questions: vector::empty<Question>(),
            revies: vector::empty<Review>(),
            course_xp: xp,
            difficulty_level,
        };
        let sender : address = tx_context::sender(ctx);
        transfer::transfer(course, sender);
    }

    public fun check_correct_answer(course: &Course, question_text: String, answer: String): bool {
        let i = find_question_index(course, question_text);
        vector::borrow(&course.questions, i).correct_answer == answer
    }

    public fun add_question(course: &mut Course, question_text: String, correct_answer: String) {
        let question = Question {
            text: question_text,
            correct_answer,
        };
        vector::push_back(&mut course.questions, question);
    }

    public fun remove_question(course: &mut Course, question_text: String) {
        let i = find_question_index(course, question_text);
        vector::remove(&mut course.questions, i);
    }

    fun find_question_index(course: &Course, question_text: String): u64 {
        let len = vector::length(&course.questions);
        let mut i = 0;
        while (i < len) {
            if (vector::borrow(&course.questions, i).text == question_text) {
                return i
            };
            i = i + 1;
        };
        abort(1)
    }

    public fun view_questions(course: &Course): vector<Question> {
        course.questions
    }

    public fun update_course_name(course: &mut Course, new_name: String) {
        course.name = new_name;
    }

    public fun update_course_description(course: &mut Course, new_description: String) {
        course.description = new_description;
    }

    public fun update_course_xp(course: &mut Course, new_xp: u64) {
        course.course_xp = new_xp;
    }

    public fun update_course_difficulty_level(course: &mut Course, new_difficulty_level: u8) {
        course.difficulty_level = new_difficulty_level;
    }

    public fun enroll_student(course: &mut Course, student_address: address) {
        vector::push_back(&mut course.students, student_address);
        course.num_of_students = course.num_of_students + 1;
    }

    public fun unenroll_student(course: &mut Course, student_address: address) {
        let i = find_student_index(course, student_address);
        vector::remove(&mut course.students, i);
        course.num_of_students = course.num_of_students - 1;
    }

    fun find_student_index(course: &Course, student_address: address): u64 {
        let len = vector::length(&course.students);
        let mut i = 0;
        while (i < len) {
            if (vector::borrow(&course.students, i) == &student_address) {
                return i
            };
            i = i + 1;
        };
        abort(1)
    }

    public fun view_course(course: &Course): (String, String, u64, address, vector<address>) {
        (course.name, course.description, course.num_of_students, course.created_by, course.students)
    }

    public fun add_review(course: &mut Course, student_address: address, rating: u8, review_text: option::Option<String>) {
        let review = Review {
            student: student_address,
            rating,
            review_text: review_text,
        };
        vector::push_back(&mut course.revies, review);
    }
}

