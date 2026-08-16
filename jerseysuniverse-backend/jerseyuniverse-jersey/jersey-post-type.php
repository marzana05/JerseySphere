<?php
/*
 * Plugin Name: JerseyUniverse - Jersey Post Type
 * Description: Registers the Jersey product type and its custom fields for Jersey Universe
 * Version: 1.0
 * Author: Team 10
 */

function jerseyuniverse_register_jersey_post_type() {
    register_post_type('jersey', array(
        'labels' => array(
            'name'          => 'Jerseys',
            'singular_name' => 'Jersey',
            'add_new'       => 'Add New Jersey',
            'add_new_item'  => 'Add New Jersey',
            'edit_item'     => 'Edit Jersey',
            'all_items'     => 'All Jerseys',
        ),
        'public'       => true,
        'show_in_rest' => true,
        'supports'     => array('title', 'thumbnail'),
        'menu_icon'    => 'dashicons-store',
    ));
}
add_action('init', 'jerseyuniverse_register_jersey_post_type');


function jerseyuniverse_jersey_meta_box() {
    add_meta_box(
        'jersey_details',
        'Jersey Details',
        'jerseyuniverse_jersey_fields_html',
        'jersey',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'jerseyuniverse_jersey_meta_box');


function jerseyuniverse_jersey_fields_html($post) {
    wp_nonce_field('jerseyuniverse_jersey_save', 'jerseyuniverse_jersey_nonce');

    $price            = get_post_meta($post->ID, 'price',            true);
    $customization_fee = get_post_meta($post->ID, 'customization_fee', true);
    $club             = get_post_meta($post->ID, 'club',             true);
    $season           = get_post_meta($post->ID, 'season',           true);
    $kit              = get_post_meta($post->ID, 'kit',              true);
    $league           = get_post_meta($post->ID, 'league',           true);
    $type             = get_post_meta($post->ID, 'type',             true);
    $stock            = get_post_meta($post->ID, 'stock',            true);
    $desc             = get_post_meta($post->ID, 'desc',             true);
    $back_image       = get_post_meta($post->ID, 'back_image',       true);
    $closeup_image    = get_post_meta($post->ID, 'closeup_image',    true);

    echo '<table style="width:100%;border-collapse:collapse;">';

    echo '<tr><td style="padding:8px;width:160px;"><strong>Price (Tk)</strong></td>';
    echo '<td><input type="number" name="price" value="' . esc_attr($price) . '" style="width:100%;padding:6px;" placeholder="e.g. 3800" /></td></tr>';

    echo '<tr><td style="padding:8px;"><strong>Customization Fee (Tk)</strong></td>';
    echo '<td><input type="number" name="customization_fee" value="' . esc_attr($customization_fee ?: 300) . '" style="width:100%;padding:6px;" placeholder="e.g. 300" /></td></tr>';

    echo '<tr><td style="padding:8px;"><strong>Club</strong></td>';
    echo '<td><input type="text" name="club" value="' . esc_attr($club) . '" style="width:100%;padding:6px;" placeholder="e.g. real-madrid" /></td></tr>';

    echo '<tr><td style="padding:8px;"><strong>Season</strong></td>';
    echo '<td><input type="text" name="season" value="' . esc_attr($season) . '" style="width:100%;padding:6px;" placeholder="e.g. 2026 or 1998-99" /></td></tr>';

    echo '<tr><td style="padding:8px;"><strong>Kit Type</strong></td>';
    echo '<td><select name="kit" style="width:100%;padding:6px;">';
    foreach (array('Home', 'Away', 'Third') as $option) {
        echo '<option value="' . $option . '"' . selected($kit, $option, false) . '>' . $option . '</option>';
    }
    echo '</select></td></tr>';

    echo '<tr><td style="padding:8px;"><strong>Era</strong></td>';
    echo '<td><select name="type" style="width:100%;padding:6px;">';
    foreach (array('2026', 'retro') as $option) {
        echo '<option value="' . $option . '"' . selected($type, $option, false) . '>' . $option . '</option>';
    }
    echo '</select></td></tr>';

    echo '<tr><td style="padding:8px;"><strong>League</strong></td>';
    echo '<td><input type="text" name="league" value="' . esc_attr($league) . '" style="width:100%;padding:6px;" placeholder="e.g. La Liga, UCL" /></td></tr>';

    echo '<tr><td style="padding:8px;"><strong>Description</strong></td>';
    echo '<td><textarea name="desc" style="width:100%;padding:6px;height:60px;" placeholder="Short product description">' . esc_textarea($desc) . '</textarea></td></tr>';

    echo '<tr><td style="padding:8px;" colspan="2"><strong>Stock per size</strong></td></tr>';
    foreach (array('XS','S','M','L','XL','2XL','3XL') as $size) {
        $stock_data = is_array($stock) ? $stock : array();
        $val = isset($stock_data[$size]) ? $stock_data[$size] : 0;
        echo '<tr><td style="padding:8px;padding-left:20px;">' . $size . '</td>';
        echo '<td><input type="number" name="stock[' . $size . ']" value="' . esc_attr($val) . '" style="width:120px;padding:6px;" min="0" /></td></tr>';
    }

    echo '</table>';

    // --- Additional Images ---
    echo '<hr style="margin:16px 0;" />';
    echo '<p><strong>Additional Images</strong> — Back View and Close Up tabs on the product page</p>';
    echo '<table style="width:100%;border-collapse:collapse;">';

    echo '<tr><td style="padding:8px;width:160px;"><strong>Back View</strong></td><td style="padding:8px;">';
    echo '<input type="hidden" id="back_image" name="back_image" value="' . esc_attr($back_image) . '" />';
    if ($back_image) echo '<img src="' . esc_url($back_image) . '" style="max-width:100px;display:block;margin-bottom:6px;" />';
    echo '<button type="button" class="button ju-upload" data-target="back_image">Upload Back View</button>';
    if ($back_image) echo ' <button type="button" class="button ju-remove" data-target="back_image">Remove</button>';
    echo '</td></tr>';

    echo '<tr><td style="padding:8px;"><strong>Close Up</strong></td><td style="padding:8px;">';
    echo '<input type="hidden" id="closeup_image" name="closeup_image" value="' . esc_attr($closeup_image) . '" />';
    if ($closeup_image) echo '<img src="' . esc_url($closeup_image) . '" style="max-width:100px;display:block;margin-bottom:6px;" />';
    echo '<button type="button" class="button ju-upload" data-target="closeup_image">Upload Close Up</button>';
    if ($closeup_image) echo ' <button type="button" class="button ju-remove" data-target="closeup_image">Remove</button>';
    echo '</td></tr>';

    echo '</table>';
    ?>
    <script>
    jQuery(function($) {
        $(document).on('click', '.ju-upload', function(e) {
            e.preventDefault();
            var target = $(this).data('target');
            var frame = wp.media({ title: 'Select Image', multiple: false });
            frame.on('select', function() {
                var url = frame.state().get('selection').first().toJSON().url;
                $('#' + target).val(url);
                location.reload();
            });
            frame.open();
        });
        $(document).on('click', '.ju-remove', function(e) {
            e.preventDefault();
            $('#' + $(this).data('target')).val('');
            location.reload();
        });
    });
    </script>
    <?php
}


function jerseyuniverse_jersey_save($post_id) {
    if (!isset($_POST['jerseyuniverse_jersey_nonce'])) return;
    if (!wp_verify_nonce($_POST['jerseyuniverse_jersey_nonce'], 'jerseyuniverse_jersey_save')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    $fields = array('price', 'customization_fee', 'club', 'season', 'kit', 'type', 'league', 'desc', 'back_image', 'closeup_image');
    foreach ($fields as $field) {
        if (isset($_POST[$field])) {
            update_post_meta($post_id, $field, sanitize_text_field($_POST[$field]));
        }
    }

    if (isset($_POST['stock']) && is_array($_POST['stock'])) {
        $clean_stock = array();
        foreach ($_POST['stock'] as $size => $qty) {
            $clean_stock[sanitize_text_field($size)] = intval($qty);
        }
        update_post_meta($post_id, 'stock', $clean_stock);
    }
}
add_action('save_post', 'jerseyuniverse_jersey_save');


function jerseyuniverse_jersey_register_rest_fields() {
    $fields = array('price', 'customization_fee', 'club', 'season', 'kit', 'type', 'league', 'desc', 'stock', 'back_image', 'closeup_image');
    foreach ($fields as $field) {
        register_rest_field('jersey', $field, array(
            'get_callback' => function($post) use ($field) {
                return get_post_meta($post['id'], $field, true);
            },
            'schema' => null,
        ));
    }

    // Expose featured image URL directly — avoids _embedded permission issues
    register_rest_field('jersey', 'front_image', array(
        'get_callback' => function($post) {
            $thumbnail_id = get_post_thumbnail_id($post['id']);
            if (!$thumbnail_id) return null;
            $src = wp_get_attachment_image_src($thumbnail_id, 'full');
            return $src ? $src[0] : null;
        },
        'schema' => null,
    ));
}
add_action('rest_api_init', 'jerseyuniverse_jersey_register_rest_fields');
