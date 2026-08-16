<?php
/*
 * Plugin Name: JerseyUniverse - Review API
 * Description: Custom REST API endpoints for product reviews
 * Version: 1.0
 * Author: Team 10
 */

/* -------------------------------------------------------
   Register a custom post type for reviews
------------------------------------------------------- */
function jerseyuniverse_register_review_post_type() {
    register_post_type('jersey_review', array(
        'labels'       => array(
            'name'          => 'Reviews',
            'singular_name' => 'Review',
            'all_items'     => 'All Reviews',
        ),
        'public'       => false,
        'show_ui'      => true,
        'show_in_rest' => true,
        'supports'     => array('title'),
        'menu_icon'    => 'dashicons-star-filled',
    ));
}
add_action('init', 'jerseyuniverse_register_review_post_type');


/* -------------------------------------------------------
   Add meta box to show review details in wp-admin
------------------------------------------------------- */
function jerseyuniverse_review_meta_box() {
    add_meta_box(
        'review_details',
        'Review Details',
        'jerseyuniverse_review_fields_html',
        'jersey_review',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'jerseyuniverse_review_meta_box');

function jerseyuniverse_review_fields_html($post) {
    $product_id    = get_post_meta($post->ID, 'product_id',    true);
    $reviewer_name = get_post_meta($post->ID, 'reviewer_name', true);
    $rating        = get_post_meta($post->ID, 'rating',        true);
    $body          = get_post_meta($post->ID, 'body',          true);
    $verified      = get_post_meta($post->ID, 'verified',      true);
    $date          = get_post_meta($post->ID, 'date',          true);

    echo '<table style="width:100%;border-collapse:collapse;">';

    echo '<tr><td style="padding:8px;width:160px;"><strong>Product</strong></td>';
    echo '<td style="padding:8px;">' . esc_html($product_id) . '</td></tr>';

    echo '<tr><td style="padding:8px;"><strong>Reviewer</strong></td>';
    echo '<td style="padding:8px;">' . esc_html($reviewer_name) . '</td></tr>';

    echo '<tr><td style="padding:8px;"><strong>Rating</strong></td>';
    echo '<td style="padding:8px;">' . esc_html($rating) . ' / 5 stars</td></tr>';

    echo '<tr><td style="padding:8px;"><strong>Review</strong></td>';
    echo '<td style="padding:8px;"><p style="white-space:pre-wrap;">' . esc_html($body) . '</p></td></tr>';

    echo '<tr><td style="padding:8px;"><strong>Verified Purchase</strong></td>';
    echo '<td style="padding:8px;">' . ($verified === '1' ? 'Yes' : 'No') . '</td></tr>';

    echo '<tr><td style="padding:8px;"><strong>Date</strong></td>';
    echo '<td style="padding:8px;">' . esc_html($date) . '</td></tr>';

    echo '</table>';
}


function jerseyuniverse_register_review_routes() {
    register_rest_route('jerseyuniverse/v1', '/reviews', array(
        array(
            'methods'             => 'GET',
            'callback'            => 'jerseyuniverse_get_reviews',
            'permission_callback' => '__return_true',
        ),
        array(
            'methods'             => 'POST',
            'callback'            => 'jerseyuniverse_submit_review',
            'permission_callback' => '__return_true',
        ),
    ));

    register_rest_route('jerseyuniverse/v1', '/reviews/(?P<id>\d+)', array(
        'methods'             => 'DELETE',
        'callback'            => 'jerseyuniverse_delete_review',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'jerseyuniverse_register_review_routes');


/* -------------------------------------------------------
   GET reviews for a specific product
------------------------------------------------------- */
function jerseyuniverse_get_reviews($request) {
    $product_id = sanitize_text_field($request->get_param('product'));

    $args = array(
        'post_type'   => 'jersey_review',
        'post_status' => 'publish',
        'numberposts' => -1,
        'orderby'     => 'date',
        'order'       => 'DESC',
    );

    if ($product_id) {
        $args['meta_query'] = array(
            array(
                'key'   => 'product_id',
                'value' => $product_id,
            ),
        );
    }

    $posts   = get_posts($args);
    $reviews = array();

    foreach ($posts as $post) {
        $reviews[] = array(
            'id'       => $post->ID,
            'name'     => get_post_meta($post->ID, 'reviewer_name', true),
            'rating'   => intval(get_post_meta($post->ID, 'rating', true)),
            'title'    => get_post_meta($post->ID, 'title', true),
            'body'     => get_post_meta($post->ID, 'body', true),
            'verified' => get_post_meta($post->ID, 'verified', true) === '1',
            'date'     => get_post_meta($post->ID, 'date', true),
            'userId'   => get_post_meta($post->ID, 'user_id', true),
        );
    }

    return $reviews;
}


/* -------------------------------------------------------
   POST — submit a new review
------------------------------------------------------- */
function jerseyuniverse_submit_review($request) {
    $data = $request->get_json_params();

    if (empty($data['body']) || strlen($data['body']) < 20) {
        return new WP_Error('invalid_review', 'Review body must be at least 20 characters.', array('status' => 400));
    }

    $post_id = wp_insert_post(array(
        'post_type'   => 'jersey_review',
        'post_status' => 'publish',
        'post_title'  => sanitize_text_field($data['title'] ?? 'Review'),
    ));

    if (is_wp_error($post_id)) {
        return new WP_Error('review_failed', 'Could not save review.', array('status' => 500));
    }

    update_post_meta($post_id, 'product_id',     sanitize_text_field($data['productId'] ?? ''));
    update_post_meta($post_id, 'reviewer_name',  sanitize_text_field($data['name'] ?? 'Guest'));
    update_post_meta($post_id, 'rating',         intval($data['rating'] ?? 5));
    update_post_meta($post_id, 'title',          sanitize_text_field($data['title'] ?? 'No title'));
    update_post_meta($post_id, 'body',           sanitize_textarea_field($data['body'] ?? ''));
    update_post_meta($post_id, 'verified',       !empty($data['verified']) ? '1' : '0');
    update_post_meta($post_id, 'user_id',        sanitize_text_field($data['userId'] ?? ''));
    update_post_meta($post_id, 'date',           current_time('c'));

    return array(
        'success' => true,
        'id'      => $post_id,
        'date'    => current_time('c'),
    );
}


/* -------------------------------------------------------
   DELETE — remove a review (only by the reviewer)
------------------------------------------------------- */
function jerseyuniverse_delete_review($request) {
    $post_id = intval($request->get_param('id'));
    $user_id = sanitize_text_field($request->get_param('userId'));

    $stored_user = get_post_meta($post_id, 'user_id', true);

    if (empty($user_id) || $stored_user !== $user_id) {
        return new WP_Error('forbidden', 'You can only delete your own reviews.', array('status' => 403));
    }

    wp_delete_post($post_id, true);
    return array('success' => true);
}
