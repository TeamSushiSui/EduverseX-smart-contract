/// Module: eduversex_database
module eduversex_database::eduversex_database {
    use std::string::String;
    /// Structure representing a user with various attributes
    public struct User has store, drop {
        name: String,                       // User's name
        user_address: address,              // User's address
        xp: u64,                            // User's experience points (XP)
        enrolled_courses: vector<address>,  // Addresses of courses the user is enrolled in
        completed_courses: vector<address>, // Addresses of courses the user has completed
        badges: vector<String>,             // Badges awarded to the user
    }

    /// Structure representing a course
    public struct Course has store, drop {
        name: String,               // Course name
        description: String,        // Course description
        contract_address: address,  // Contract address for the course
    }

    /// Structure representing a game
    public struct Game has store, drop {
        name: String,               // Game name
        description: String,        // Game description
        contract_address: address,  // Contract address for the game
    }

    /// Main Object representing the database for the EduverseX platform
    public struct EduverseX_users has key {
        id: UID,                    // Unique identifier for the database
        users: vector<User>,         // List of users
        courses: vector<Course>,     // List of courses
        games: vector<Game>,         // List of games
        nfts : vector<address>,      // List of NFTs
    }

    /// Function to initialize the EduverseX database
    fun init(ctx: &mut TxContext) {
        let users: EduverseX_users = EduverseX_users {
            id: object::new(ctx),                     // Create new unique ID for the database
            users: vector::empty<User>(),             // Initialize empty user vector
            courses: vector::empty<Course>(),         // Initialize empty course vector
            games: vector::empty<Game>(),             // Initialize empty game vector
            nfts : vector::empty<address>(),          // Initialize empty NFT vector
        };
        let sender: address = tx_context::sender(ctx); // Get the address of the sender
        transfer::transfer(users, sender);             // Transfer ownership of the database to the sender
    }

    fun check_user(database: &EduverseX_users, user_address: address): bool {
        let num_users: u64 = vector::length(&database.users);
        let mut i = 0;
        while(i < num_users) {
            let user = vector::borrow(&database.users, i);
            if (user.user_address == user_address) {
                return true
            };
            i = i + 1;
        };
        return false
    }

    /// Function to add a user to the database
    public fun add_user(database: &mut EduverseX_users, user_address: address, name: String) {
        let user_exists  = check_user(database, user_address);
        assert!(!user_exists, 0);
        let user: User = User {
            name: name,
            user_address: user_address,
            xp: 0,                                     // Set initial XP to 0
            enrolled_courses: vector::empty<address>(),// Initialize empty enrolled courses
            completed_courses: vector::empty<address>(),// Initialize empty completed courses
            badges: vector::empty<String>(),            // Initialize empty badges
        };
        vector::push_back(&mut database.users, user);  // Add the user to the database
    }
    
    /// Function to remove a user from the database
    public fun remove_user(database: &mut EduverseX_users, user_address: address) {
        let num_users: u64 = vector::length(&database.users); // Get number of users in the database
        let mut i = 0;
        while(i < num_users) {
            let user = vector::borrow(&database.users, i);
            if (user.user_address == user_address) {          // Check if user's address matches
                vector::swap_remove(&mut database.users, i);  // Remove the user
                break
            };
            i = i + 1;
        };
    }

    public fun add_nft(database: &mut EduverseX_users, nft_address: address) {
        vector::push_back(&mut database.nfts, nft_address);
    }

    public fun remove_nft(database: &mut EduverseX_users, nft_address: address) {
        let num_nfts: u64 = vector::length(&database.nfts); // Get number of users in the database
        let mut i = 0;
        while(i < num_nfts) {
            let nft = vector::borrow(&database.nfts, i);
            if (nft == nft_address) {          // Check if user's address matches
                vector::swap_remove(&mut database.nfts, i);  // Remove the user
                break
            };
            i = i + 1;
        };
    }

    public fun get_all_nfts(database: &EduverseX_users) : vector<address> {
        return database.nfts
    }

    /// Function to retrieve a user from the database by address
    public entry fun get_user(database: &EduverseX_users, user_address: address) : (String, u64) {
        let num_users: u64 = vector::length(&database.users);
        let mut i = 0;
        while(i < num_users) {
            let user = vector::borrow(&database.users, i);
            if (user.user_address == user_address) {         // Check if user's address matches
                return (user.name, user.xp)                 // Return user's name and XP
            };
            i = i + 1;
        };
        return (b"".to_string(), 0)                        // Return empty string and 0 XP if not found
    }

    /// Function to update a user's XP
    public fun update_xp(database: &mut EduverseX_users, user_address: address, xp: u64) {
        let num_users: u64 = vector::length(&database.users);
        let mut i = 0;
        while(i < num_users) {
            let user = vector::borrow_mut(&mut database.users, i);
            if (user.user_address == user_address) {
                user.xp = user.xp + xp;                      // Increase user's XP
                break
            };
            i = i + 1;
        };
    }

    fun check_course(database: &EduverseX_users, contract_address: address): bool {
        let num_courses: u64 = vector::length(&database.courses);
        let mut i = 0;
        while(i < num_courses) {
            let course = vector::borrow(&database.courses, i);
            if (course.contract_address == contract_address) {
                return true
            };
            i = i + 1;
        };
        return false
    }

    /// Function to add a course to the database
    public fun add_course(database: &mut EduverseX_users, name: String, description: String, contract_address: address) {
        let course_exists  = check_course(database, contract_address);
        assert!(!course_exists, 0);
        let course: Course = Course {
            name: name,
            description: description,
            contract_address: contract_address,
        };
        vector::push_back(&mut database.courses, course);     // Add course to the database
    }

    fun check_game(database: &EduverseX_users, contract_address: address): bool {
        let num_games: u64 = vector::length(&database.games);
        let mut i = 0;
        while(i < num_games) {
            let game = vector::borrow(&database.games, i);
            if (game.contract_address == contract_address) {
                return true
            };
            i = i + 1;
        };
        return false
    }

    /// Function to add a game to the database
    public fun add_game(database: &mut EduverseX_users, name: String, description: String, contract_address: address) {
        let game_exists  = check_game(database, contract_address);
        assert!(!game_exists, 0);
        let game: Game = Game {
            name: name,
            description: description,
            contract_address: contract_address,
        };
        vector::push_back(&mut database.games, game);         // Add game to the database
    }

    /// Function to remove a course by its contract address
    public fun remove_course(database: &mut EduverseX_users, contract_address: address) {
        let num_courses: u64 = vector::length(&database.courses);
        let mut i = 0;
        while(i < num_courses) {
            let course = vector::borrow(&database.courses, i);
            if (course.contract_address == contract_address) { // Check if contract address matches
                vector::remove(&mut database.courses, i);      // Remove course from the database
                break
            };
            i = i + 1;
        };
    }

    /// Function to remove a game by its contract address
    public fun remove_game(database: &mut EduverseX_users, contract_address: address) {
        let num_games: u64 = vector::length(&database.games);
        let mut i = 0;
        while(i < num_games) {
            let game = vector::borrow(&database.games, i);
            if (game.contract_address == contract_address) {  // Check if contract address matches
                vector::remove(&mut database.games, i);       // Remove game from the database
                break
            };
            i = i + 1;
        };
    }

    /// Function to update course details in the database
    public fun update_course(database: &mut EduverseX_users, new_name: String, new_description: String, contract_address: address) {
        let num_courses: u64 = vector::length(&database.courses);
        let mut i = 0;
        while(i < num_courses) {
            let course = vector::borrow_mut(&mut database.courses, i);
            if (course.contract_address == contract_address) { // Check if contract address matches
                course.name = new_name;                        // Update course name
                course.description = new_description;          // Update course description
                break
            };
            i = i + 1;
        };
    }

    /// Function to retrieve a course by contract address
    public entry fun get_course(database: &EduverseX_users, contract_address: address) : (String, String) {
        let num_courses: u64 = vector::length(&database.courses);
        let mut i = 0;
        while(i < num_courses) {
            let course = vector::borrow(&database.courses, i);
            if (course.contract_address == contract_address) {
                return (course.name, course.description)      // Return course name and description
            };
            i = i + 1;
        };
        return (b"".to_string(), b"".to_string())             // Return empty strings if not found
    }

    /// Function to retrieve a game by contract address
    public entry fun get_game(database: &EduverseX_users, contract_address: address) : (String, String) {
        let num_games: u64 = vector::length(&database.games);
        let mut i = 0;
        while(i < num_games) {
            let game = vector::borrow(&database.games, i);
            if (game.contract_address == contract_address) {
                return (game.name, game.description)          // Return game name and description
            };
            i = i + 1;
        };
        return (b"".to_string(), b"".to_string())             // Return empty strings if not found
    }

    /// Placeholder function for rewarding XP or tokens to users for winning games
    #[allow(unused_variable)]
    public fun reward_user_for_game(database: &mut EduverseX_users, user_address: address, reward_xp: u64) {
        // Logic for rewarding XP or tokens to users for completing or winning games
    }


    /// Placeholder function for earning tokens through learning or gaming
    #[allow(unused_variable)]
    public fun earn_tokens(database: &mut EduverseX_users, user_address: address, amount: u64) {
        // Logic for earning tokens through learning or gaming
    }

    // Function to enroll a user in a course by checking if the user is already enrolled
    public fun enroll_in_course(database: &mut EduverseX_users, user_address: address, course_address: address) {
        // Get the total number of users in the database
        let num_users: u64 = vector::length(&database.users);
        let mut i = 0;

        // Loop through the users to find the user by address
        while(i < num_users) {
            let user = vector::borrow_mut(&mut database.users, i);

            // Check if the current user matches the user_address and is not already enrolled in the course
            if (user.user_address == user_address && !vector::contains(&user.enrolled_courses, &course_address)) {
                // Enroll the user in the course by adding the course address to enrolled_courses vector
                vector::push_back(&mut user.enrolled_courses, course_address);
                break // Exit the loop once the user is enrolled
            };
            i = i + 1;
        };
    }

    // Function to mark a course as completed for a user
    public fun complete_course(database: &mut EduverseX_users, user_address: address, contract_address: address) {
        // Get the total number of users in the database
        let num_users : u64 = vector::length(&database.users);
        let mut i = 0;

        // Loop through the users to find the user by address
        while(i < num_users) {
            let user = vector::borrow_mut(&mut database.users, i);

            // Check if the current user matches the user_address
            if (user.user_address == user_address) {

                // Check if the user has not already completed the course
                if (!vector::contains(&user.completed_courses, &contract_address)) {
                    // Add the course address to completed_courses vector
                    vector::push_back(&mut user.completed_courses, contract_address);

                    // Uncomment the line below to reward the user with XP after completing the course
                    // user.xp = user.xp + 50; // Adjust XP reward
                };
                break // Exit the loop once the course is marked as completed
            };
            i = i + 1;
        };
    }

    // Function to award a badge to a user
    public fun award_badge(database: &mut EduverseX_users, user_address: address, badge: String) {
        // Get the total number of users in the database
        let num_users : u64 = vector::length(&database.users);
        let mut i = 0;

        // Loop through the users to find the user by address
        while(i < num_users) {
            let user = vector::borrow_mut(&mut database.users, i);

            // Check if the current user matches the user_address
            if (user.user_address == user_address) {
                // Add the badge to the user's badges vector
                vector::push_back(&mut user.badges, badge);
                break // Exit the loop once the badge is awarded
            };
            i = i + 1;
        };
    }

    // Function to retrieve all course contract addresses from the database
    public entry fun get_all_courses_addresses(database: &EduverseX_users) : vector<address> {
        // Get the total number of courses in the database
        let num_courses: u64 = vector::length(&database.courses);
        let mut i = 0;

        // Initialize an empty vector to hold the course addresses
        let mut addresses = vector::empty<address>();

        // Loop through the courses and collect their contract addresses
        while (i < num_courses) {
            let course = vector::borrow(&database.courses, i);
            vector::push_back(&mut addresses, course.contract_address);
            i = i + 1;
        };

        // Return the vector of course contract addresses
        return addresses
    }

    // Function to retrieve all game contract addresses from the database
    public entry fun get_all_game_addresses(database: &EduverseX_users) : vector<address> {
        // Get the total number of courses in the database
        let num_courses: u64 = vector::length(&database.courses);
        let mut i = 0;

        // Initialize an empty vector to hold the game addresses
        let mut addresses = vector::empty<address>();

        // Loop through the courses and collect their contract addresses
        while (i < num_courses) {
            let course = vector::borrow(&database.courses, i);
            vector::push_back(&mut addresses, course.contract_address);
            i = i + 1;
        };

        // Return the vector of game contract addresses
        return addresses
    }

}