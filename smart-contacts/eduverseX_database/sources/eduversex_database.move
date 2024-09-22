/// Module: eduversex_database
module eduversex_database::eduversex_database {
    use std::string::String;
    public struct User has store, drop{
        name : String,
        user_address : address,
        xp : u64,
        enrolled_courses : vector<address>,
        completed_courses : vector<address>,
        badges : vector<String>,
    }

    public struct Course has store, drop{
        name : String,
        description : String,
        contract_address : address,
    }

    public struct Game has store, drop{
        name : String,
        description : String,
        contract_address : address,
    }

    public struct EduverseX_users has key{
        id : UID,
        users : vector<User>,
        courses : vector<Course>,
        games : vector<Game>
    }

    fun init(ctx : &mut TxContext) {
        let users : EduverseX_users = EduverseX_users {
            id : object::new(ctx),
            users : vector::empty<User>(),
            courses : vector::empty<Course>(),
            games : vector::empty<Game>()
        };
        let sender : address = tx_context::sender(ctx);
        transfer::transfer(users, sender);
    }

    public entry fun add_user(database : &mut EduverseX_users, user_address : address, name : String) {
        let user : User = User {
            name : name,
            user_address : user_address,
            xp : 0,
            enrolled_courses : vector::empty<address>(),
            completed_courses : vector::empty<address>(),
            badges : vector::empty<String>(),
        };
        vector::push_back(&mut database.users, user);
    }
    
    public entry fun remove_user(database: &mut EduverseX_users, user_address: address) {
        let num_users: u64 = vector::length(&database.users);
        let mut i = 0;
        while(i < num_users) {
            let user = vector::borrow(&database.users, i);
            if (user.user_address == user_address) {
                vector::swap_remove(&mut database.users, i);
                break
            };
            i = i + 1;
        };
    }

    public entry fun get_user(database : &EduverseX_users, user_address : address) : (String, u64) {
        let num_users : u64 = vector::length(&database.users);
        let mut i = 0;
        while(i < num_users) {
            let user = vector::borrow(&database.users, i);
            if (user.user_address == user_address) {
                return (user.name, user.xp)
            };
            i = i + 1;
        };
        return (b"".to_string(), 0)
    }

    public entry fun update_xp(database : &mut EduverseX_users, user_address : address, xp : u64) {
        let num_users : u64 = vector::length(&database.users);
        let mut i = 0;
        while(i < num_users) {
            let user = vector::borrow_mut(&mut database.users, i);
            if (user.user_address == user_address) {
                user.xp = user.xp + xp;
                break
            };
            i = i + 1;
        };
    }

    public entry fun add_course(database : &mut EduverseX_users, name : String, description : String, contract_address : address) {
        let course : Course = Course {
            name : name,
            description : description,
            contract_address : contract_address
        };
        vector::push_back(&mut database.courses, course);
    }

    public entry fun add_game(database : &mut EduverseX_users, name : String, description : String, contract_address : address) {
        let game : Game = Game {
            name : name,
            description : description,
            contract_address : contract_address
        };
        vector::push_back(&mut database.games, game);
    }

    public entry fun remove_course(database: &mut EduverseX_users, contract_address: address) {
        let num_courses: u64 = vector::length(&database.courses);
        let mut i = 0;
        while(i < num_courses) {
            let course = vector::borrow(&database.courses, i);
            if (course.contract_address == contract_address) {
                vector::remove(&mut database.courses, i);
                break
            };
            i = i + 1;
        };
    }

    public entry fun remove_game(database: &mut EduverseX_users, contract_address: address) {
        let num_games: u64 = vector::length(&database.games);
        let mut i = 0;
        while(i < num_games) {
            let game = vector::borrow(&database.games, i);
            if (game.contract_address == contract_address) {
                vector::remove(&mut database.games, i);
                break
            };
            i = i + 1;
        };
    }

    public entry fun update_course(database: &mut EduverseX_users, contract_address: address, new_name: String, new_description: String) {
        let num_courses: u64 = vector::length(&database.courses);
        let mut i = 0;
        while(i < num_courses) {
            let course = vector::borrow_mut(&mut database.courses, i);
            if (course.contract_address == contract_address) {
                course.name = new_name;
                course.description = new_description;
                break
            };
            i = i + 1;
        };
    }

    public entry fun get_course(database: &EduverseX_users, contract_address: address) : (String, String) {
        let num_courses: u64 = vector::length(&database.courses);
        let mut i = 0;
        while(i < num_courses) {
            let course = vector::borrow(&database.courses, i);
            if (course.contract_address == contract_address) {
                return (course.name, course.description)
            };
            i = i + 1;
        };
        return (b"".to_string(), b"".to_string())
    }

    public entry fun get_game(database: &EduverseX_users, contract_address: address) : (String, String) {
        let num_games: u64 = vector::length(&database.games);
        let mut i = 0;
        while(i < num_games) {
            let game = vector::borrow(&database.games, i);
            if (game.contract_address == contract_address) {
                return (game.name, game.description)
            };
            i = i + 1;
        };
        return (b"".to_string(), b"".to_string())
    }

    #[allow(unused_variable)]
    public entry fun reward_user_for_game(database: &mut EduverseX_users, user_address: address, reward_xp: u64) {
        // Logic for rewarding XP or tokens to users for completing or winning games
    }

    #[allow(unused_variable)]
    public entry fun earn_tokens(database: &mut EduverseX_users, user_address: address, amount: u64) {
        // Logic for earning tokens through learning or gaming
    }

    public entry fun enroll_in_course(database: &mut EduverseX_users, user_address: address, course_address: address) {
        let num_users: u64 = vector::length(&database.users);
        let mut i = 0;
        while(i < num_users) {
            let user = vector::borrow_mut(&mut database.users, i);
            if (user.user_address == user_address && !vector::contains(&user.enrolled_courses, &course_address)) {
                vector::push_back(&mut user.enrolled_courses, course_address);
                break
            };
            i = i + 1;
        };
    }

    public entry fun complete_course(database: &mut EduverseX_users, user_address: address, contract_address: address) {
        let num_users : u64 = vector::length(&database.users);
        let mut i = 0;
        while(i < num_users) {
            let user = vector::borrow_mut(&mut database.users, i);
            if (user.user_address == user_address) {
                if (!vector::contains(&user.completed_courses, &contract_address)) {
                    vector::push_back(&mut user.completed_courses, contract_address);
                    // user.xp = user.xp + 50; // Adjust XP reward
                };
                break
            };
            i = i + 1;
        };
    }

    public entry fun award_badge(database: &mut EduverseX_users, user_address: address, badge: String) {
        let num_users : u64 = vector::length(&database.users);
        let mut i = 0;
        while(i < num_users) {
            let user = vector::borrow_mut(&mut database.users, i);
            if (user.user_address == user_address) {
                vector::push_back(&mut user.badges, badge);
                break
            };
            i = i + 1;
        };
    }
}