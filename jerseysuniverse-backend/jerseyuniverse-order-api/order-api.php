<?php
/*
 * Plugin Name: JerseyUniverse - Order API
 * Description: Custom REST API endpoint for receiving orders from the Jersey Universe frontend
 * Version: 1.0
 * Author: Team 10
 */

/* -------------------------------------------------------
   Register a custom REST API route that the frontend calls
   when a customer places an order.
   No authentication required — it's a public endpoint
   so any customer can submit an order.
------------------------------------------------------- */
function jerseyuniverse_register_order_api() {
    register_rest_route('jerseyuniverse/v1', '/place-order', array(
        'methods'             => 'POST',
        'callback'            => 'jerseyuniverse_receive_order',
        'permission_callback' => '__return_true', // public — no login needed
    ));

    register_rest_route('jerseyuniverse/v1', '/orders', array(
        'methods'             => 'GET',
        'callback'            => 'jerseyuniverse_get_orders',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'jerseyuniverse_register_order_api');


/* -------------------------------------------------------
   Receive order data from the frontend and save it
   as a WordPress Order entry
------------------------------------------------------- */
function jerseyuniverse_receive_order($request) {
    $data = $request->get_json_params();

    if (empty($data)) {
        return new WP_Error('no_data', 'No order data received', array('status' => 400));
    }

    // Build a readable items string including customization
    $items_text = "";
    if (!empty($data['items']) && is_array($data['items'])) {
        foreach ($data['items'] as $item) {
            $line = $item['productId'] . " (Size: " . $item['size'] . ") x" . $item['qty'];
            if (!empty($item['customization'])) {
                $custom = $item['customization'];
                if (!empty($custom['name'])) {
                    $line .= " | Customization: " . $custom['name'];
                    if (!empty($custom['number'])) {
                        $line .= " #" . $custom['number'];
                    }
                }
            }
            $items_text .= $line . "\n";
        }
    }

    // Build address string — clean, line by line
    $address = "";
    if (!empty($data['address']) && is_array($data['address'])) {
        $addr = $data['address'];
        $lines = array();
        if (!empty($addr['address'])) $lines[] = $addr['address'];
        if (!empty($addr['city']))    $lines[] = $addr['city'];
        if (!empty($addr['postal']))  $lines[] = $addr['postal'];
        if (!empty($addr['phone']))   $lines[] = "Phone: " . $addr['phone'];
        $address = implode("\n", $lines);
    }

    // Generate order ID
    $order_id = "JU-" . strtoupper(substr(md5(uniqid()), 0, 6));

    // Create the WordPress Order post
    $post_id = wp_insert_post(array(
        'post_title'  => $order_id,
        'post_type'   => 'jersey_order',
        'post_status' => 'publish',
    ));

    if (is_wp_error($post_id)) {
        return new WP_Error('order_failed', 'Could not save order', array('status' => 500));
    }

    // Save all order fields
    update_post_meta($post_id, 'customer',   sanitize_text_field(isset($data['address']['name']) ? $data['address']['name'] : 'Guest'));
    update_post_meta($post_id, 'email',      sanitize_email(isset($data['address']['email']) ? $data['address']['email'] : ''));
    update_post_meta($post_id, 'items',      sanitize_textarea_field($items_text));
    update_post_meta($post_id, 'address',    sanitize_textarea_field($address));
    update_post_meta($post_id, 'payment',    sanitize_text_field(isset($data['payment']) ? $data['payment'] : ''));
    update_post_meta($post_id, 'total',      sanitize_text_field(isset($data['total']) ? $data['total'] : '0'));
    update_post_meta($post_id, 'status',     'Order Placed');
    update_post_meta($post_id, 'created_at', date('Y-m-d H:i:s'));

    return array(
        'success'    => true,
        'id'         => $order_id,
        'post_id'    => $post_id,
        'eta'        => date('Y-m-d', strtotime('+5 days')),
        'courier'    => 'Pathao Courier',
        'tracking'   => 'TRK' . rand(100000, 999999),
        'status'     => 'Order Placed',
        'createdAt'  => time() * 1000,
    );
}


/* -------------------------------------------------------
   Get orders — shop owner can use this to see all orders
   via the API (they already see them in wp-admin too)
------------------------------------------------------- */
function jerseyuniverse_get_orders($request) {
    $posts = get_posts(array(
        'post_type'   => 'jersey_order',
        'numberposts' => -1,
        'post_status' => 'publish',
        'orderby'     => 'date',
        'order'       => 'DESC',
    ));

    $orders = array();
    foreach ($posts as $post) {
        $orders[] = array(
            'id'         => $post->post_title,
            'customer'   => get_post_meta($post->ID, 'customer',   true),
            'email'      => get_post_meta($post->ID, 'email',      true),
            'items'      => get_post_meta($post->ID, 'items',      true),
            'address'    => get_post_meta($post->ID, 'address',    true),
            'payment'    => get_post_meta($post->ID, 'payment',    true),
            'total'      => get_post_meta($post->ID, 'total',      true),
            'status'     => get_post_meta($post->ID, 'status',     true),
            'created_at' => get_post_meta($post->ID, 'created_at', true),
        );
    }

    return $orders;
}
