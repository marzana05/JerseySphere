<?php
/*
 * Plugin Name: JerseyUniverse - User API
 * Description: Custom REST API endpoints for customer registration and login
 * Version: 1.0
 * Author: Team 10
 */

function jerseyuniverse_register_user_routes() {
    register_rest_route('jerseyuniverse/v1', '/register', array(
        'methods'             => 'POST',
        'callback'            => 'jerseyuniverse_register_user',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('jerseyuniverse/v1', '/login', array(
        'methods'             => 'POST',
        'callback'            => 'jerseyuniverse_login_user',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('jerseyuniverse/v1', '/me', array(
        'methods'             => 'GET',
        'callback'            => 'jerseyuniverse_get_current_user',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('jerseyuniverse/v1', '/google-auth', array(
        'methods'             => 'POST',
        'callback'            => 'jerseyuniverse_google_auth',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'jerseyuniverse_register_user_routes');


/* -------------------------------------------------------
   REGISTER — creates a new customer account in WordPress
------------------------------------------------------- */
function jerseyuniverse_register_user($request) {
    $data = $request->get_json_params();

    if (empty($data)) {
        return new WP_Error('no_data', 'No data received.', array('status' => 400));
    }

    $email      = sanitize_email($data['email'] ?? '');
    $password   = $data['password'] ?? '';
    $first_name = sanitize_text_field($data['firstName'] ?? '');
    $last_name  = sanitize_text_field($data['lastName'] ?? '');

    if (empty($email) || empty($password) || empty($first_name)) {
        return new WP_Error('missing_fields', 'First name, email and password are required.', array('status' => 400));
    }

    if (email_exists($email)) {
        return new WP_Error('email_exists', 'An account with this email already exists.', array('status' => 409));
    }

    $user_id = wp_create_user($email, $password, $email);

    if (is_wp_error($user_id)) {
        return new WP_Error('registration_failed', $user_id->get_error_message(), array('status' => 500));
    }

    wp_update_user(array(
        'ID'           => $user_id,
        'first_name'   => $first_name,
        'last_name'    => $last_name,
        'display_name' => $first_name . ' ' . $last_name,
        'role'         => 'customer',
    ));

    return array(
        'success' => true,
        'user'    => array(
            'id'        => $user_id,
            'firstName' => $first_name,
            'lastName'  => $last_name,
            'email'     => $email,
            'verified'  => false,
            'isAdmin'   => false,
        ),
    );
}


/* -------------------------------------------------------
   LOGIN — checks credentials against WordPress users
------------------------------------------------------- */
function jerseyuniverse_login_user($request) {
    $data = $request->get_json_params();

    $email    = sanitize_email($data['email'] ?? '');
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        return new WP_Error('missing_fields', 'Email and password are required.', array('status' => 400));
    }

    $user = get_user_by('email', $email);

    if (!$user || !wp_check_password($password, $user->user_pass, $user->ID)) {
        return new WP_Error('invalid_credentials', 'Email or password is incorrect.', array('status' => 401));
    }

    return array(
        'success' => true,
        'user'    => array(
            'id'        => $user->ID,
            'firstName' => $user->first_name,
            'lastName'  => $user->last_name,
            'email'     => $user->user_email,
            'verified'  => true,
            'isAdmin'   => in_array('administrator', $user->roles),
        ),
    );
}


/* -------------------------------------------------------
   ME — get user by ID stored in localStorage session
------------------------------------------------------- */
function jerseyuniverse_get_current_user($request) {
    $user_id = intval($request->get_param('id'));
    if (!$user_id) {
        return new WP_Error('no_id', 'No user ID provided.', array('status' => 400));
    }

    $user = get_user_by('id', $user_id);
    if (!$user) {
        return new WP_Error('not_found', 'User not found.', array('status' => 404));
    }

    return array(
        'id'        => $user->ID,
        'firstName' => $user->first_name,
        'lastName'  => $user->last_name,
        'email'     => $user->user_email,
        'verified'  => true,
        'isAdmin'   => in_array('administrator', $user->roles),
    );
}


/* -------------------------------------------------------
   GOOGLE AUTH — create or find a user by Google email
------------------------------------------------------- */
function jerseyuniverse_google_auth($request) {
    $data       = $request->get_json_params();
    $email      = sanitize_email($data['email'] ?? '');
    $first_name = sanitize_text_field($data['firstName'] ?? 'User');
    $last_name  = sanitize_text_field($data['lastName'] ?? '');

    if (empty($email)) {
        return new WP_Error('invalid_data', 'Email is required.', array('status' => 400));
    }

    // Check if user already exists
    $user = get_user_by('email', $email);

    if (!$user) {
        // Create new WordPress user with a random secure password
        $random_password = wp_generate_password(24, true);
        $user_id = wp_create_user($email, $random_password, $email);

        if (is_wp_error($user_id)) {
            return new WP_Error('creation_failed', 'Could not create account.', array('status' => 500));
        }

        wp_update_user(array(
            'ID'           => $user_id,
            'first_name'   => $first_name,
            'last_name'    => $last_name,
            'display_name' => trim($first_name . ' ' . $last_name),
            'role'         => 'customer',
        ));

        update_user_meta($user_id, 'google_user', true);
        $user = get_user_by('id', $user_id);
    }

    return array(
        'success' => true,
        'user'    => array(
            'id'        => $user->ID,
            'firstName' => $user->first_name ?: $first_name,
            'lastName'  => $user->last_name  ?: $last_name,
            'email'     => $user->user_email,
            'verified'  => true,
            'isAdmin'   => in_array('administrator', (array) $user->roles),
        ),
    );
}
