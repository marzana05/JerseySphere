<?php
/*
 * Plugin Name: JerseyUniverse - Order Post Type
 * Description: Registers the Order type and its custom fields for Jersey Universe
 * Version: 1.0
 * Author: Team 10
 */

function jerseyuniverse_register_order_post_type() {
    register_post_type('jersey_order', array(
        'labels' => array(
            'name'          => 'Orders',
            'singular_name' => 'Order',
            'add_new_item'  => 'Add New Order',
            'edit_item'     => 'View Order',
            'all_items'     => 'All Orders',
        ),
        'public'       => false,
        'show_ui'      => true,
        'show_in_rest' => true,
        'supports'     => array('title'),
        'menu_icon'    => 'dashicons-cart',
    ));
}
add_action('init', 'jerseyuniverse_register_order_post_type');


function jerseyuniverse_order_meta_box() {
    add_meta_box(
        'order_details',
        'Order Details',
        'jerseyuniverse_order_fields_html',
        'jersey_order',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'jerseyuniverse_order_meta_box');


function jerseyuniverse_order_fields_html($post) {
    wp_nonce_field('jerseyuniverse_order_save', 'jerseyuniverse_order_nonce');

    $items      = get_post_meta($post->ID, 'items',      true);
    $address    = get_post_meta($post->ID, 'address',    true);
    $payment    = get_post_meta($post->ID, 'payment',    true);
    $total      = get_post_meta($post->ID, 'total',      true);
    $status     = get_post_meta($post->ID, 'status',     true);
    $customer   = get_post_meta($post->ID, 'customer',   true);
    $email      = get_post_meta($post->ID, 'email',      true);
    $created_at = get_post_meta($post->ID, 'created_at', true);

    echo '<table style="width:100%;border-collapse:collapse;">';

    echo '<tr><td style="padding:8px;width:160px;"><strong>Customer Name</strong></td>';
    echo '<td><input type="text" name="customer" value="' . esc_attr($customer) . '" style="width:100%;padding:6px;" /></td></tr>';

    echo '<tr><td style="padding:8px;"><strong>Email Address</strong></td>';
    echo '<td><input type="email" name="email" value="' . esc_attr($email) . '" style="width:100%;padding:6px;" /></td></tr>';

    echo '<tr><td style="padding:8px;"><strong>Order Status</strong></td>';
    echo '<td><select name="status" style="width:100%;padding:6px;">';
    foreach (array('Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered') as $s) {
        echo '<option value="' . $s . '"' . selected($status, $s, false) . '>' . $s . '</option>';
    }
    echo '</select></td></tr>';

    echo '<tr><td style="padding:8px;"><strong>Payment Method</strong></td>';
    echo '<td><input type="text" name="payment" value="' . esc_attr($payment) . '" style="width:100%;padding:6px;" /></td></tr>';

    echo '<tr><td style="padding:8px;"><strong>Total (Tk)</strong></td>';
    echo '<td><input type="number" name="total" value="' . esc_attr($total) . '" style="width:100%;padding:6px;" /></td></tr>';

    echo '<tr><td style="padding:8px;"><strong>Delivery Address</strong></td>';
    echo '<td><textarea name="address" style="width:100%;padding:6px;height:80px;">' . esc_textarea($address) . '</textarea></td></tr>';

    echo '<tr><td style="padding:8px;"><strong>Items Ordered</strong></td>';
    echo '<td><textarea name="items" style="width:100%;padding:6px;height:80px;">' . esc_textarea($items) . '</textarea></td></tr>';

    echo '<tr><td style="padding:8px;"><strong>Order Date</strong></td>';
    echo '<td><input type="text" name="created_at" value="' . esc_attr($created_at) . '" style="width:100%;padding:6px;" /></td></tr>';

    echo '</table>';
}


function jerseyuniverse_order_save($post_id) {
    if (!isset($_POST['jerseyuniverse_order_nonce'])) return;
    if (!wp_verify_nonce($_POST['jerseyuniverse_order_nonce'], 'jerseyuniverse_order_save')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    $fields = array('customer', 'email', 'status', 'payment', 'total', 'address', 'items', 'created_at');
    foreach ($fields as $field) {
        if (isset($_POST[$field])) {
            update_post_meta($post_id, $field, sanitize_textarea_field($_POST[$field]));
        }
    }
}
add_action('save_post', 'jerseyuniverse_order_save');


function jerseyuniverse_order_register_rest_fields() {
    $fields = array('customer', 'email', 'status', 'payment', 'total', 'address', 'items', 'created_at');
    foreach ($fields as $field) {
        register_rest_field('jersey_order', $field, array(
            'get_callback' => function($post) use ($field) {
                return get_post_meta($post['id'], $field, true);
            },
            'update_callback' => function($value, $post) use ($field) {
                update_post_meta($post->ID, $field, sanitize_textarea_field($value));
            },
            'schema' => null,
        ));
    }
}
add_action('rest_api_init', 'jerseyuniverse_order_register_rest_fields');
