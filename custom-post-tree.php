<?php 
/*Plugin Name: Xtinob Custom Tree*/
/*Description: Displays a hierarchical tree from custom post types - Instructions: Add [cpt_post_tree post_type="your_post_type"] in the widgets area*/
/*Author: Tino B*/


function my_plugin_assets() {
    wp_enqueue_style('dashicons');
    wp_enqueue_style('cpt-style', plugins_url('css/style.css', __FILE__), array(),'1.0');
    wp_enqueue_script('cpt-script', plugins_url('js/script.js', __FILE__), array('jquery'),'1.0', true);
}
add_action('wp_enqueue_scripts', 'my_plugin_assets');


function get_post_children($parent_id, $post_type) {
    $children = get_posts(array(
        'post_type' => $post_type,
        'posts_per_page' => -1,
        'post_parent' => $parent_id,
        'orderby' => 'menu_order title',
        'order' => 'ASC'
    ));

    $output = '';
    
    if (!empty($children)) {
        $output .= '<ul class="post-children" style="display: none;">';
        
        foreach ($children as $child) {
            // Check if this post has children
            $has_children = get_posts(array(
                'post_type' => $post_type,
                'posts_per_page' => 1,
                'post_parent' => $child->ID
            ));

            if (!empty($has_children)) {
                $output .= '<li class="post-parent">';
                $output .= '<a href="#" class="post-toggle"><span class="dashicons dashicons-category"></span> <span>[+] </a>';
                $output .= $child->post_title;
                $output .= get_post_children($child->ID, $post_type);
                $output .= '</li>';
            } else {
                $output .= '<li><span class="fileimg"></span> <span><a href="' . get_permalink($child->ID) . '">' . $child->post_title . '</a></li>';
            }
        }
        
        $output .= '</ul>';
    }
    
    return $output;
}

function custom_post_tree_shortcode($atts) {
    $args = shortcode_atts(array(
        'post_type' => 'page',
        'parent' => 0,
    ), $atts);

    // Get top-level posts
    $top_level_posts = get_posts(array(
        'post_type' => $args['post_type'],
        'post_parent' => $args['parent'],
        'posts_per_page' => -1,
        'orderby' => 'menu_order title',
        'order' => 'ASC'
    ));

    $output = '';
    
    if (!empty($top_level_posts)) {
        $output .= '<div id="post-tree-container"><ul class="custom-post-tree">';
        
        foreach ($top_level_posts as $post) {
            // Check if this post has children
            $has_children = get_posts(array(
                'post_type' => $args['post_type'],
                'posts_per_page' => 1,
                'post_parent' => $post->ID
            ));

            if (!empty($has_children)) {
                $output .= '<li class="post-parent">';
                $output .= '<a href="#" class="post-toggle"><span class="dashicons dashicons-category"></span> <span>[+] </a>';
                $output .= $post->post_title;
                $output .= get_post_children($post->ID, $args['post_type']);
                $output .= '</li>';
            } else {
                $output .= '<li><span class="fileimg"></span> <span><a href="' . get_permalink($post->ID) . '">' . $post->post_title . '</a></li>';
            }
        }
        
        $output .= '</ul></div>';
    }

    return $output;
}

add_shortcode('cpt_post_tree', 'custom_post_tree_shortcode');