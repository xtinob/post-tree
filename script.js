jQuery.noConflict();
jQuery(document).ready(function($) {
    // Initial page URL
    const initialURL = location.href;

    // Keep track of the currently open node
    let currentlyOpenNode = null;

    // Function to check if a node is a parent of another node
    function isParentOf($possibleParent, $child) {
        return $child.parents('li.post-parent').find('> a.post-toggle').filter(function() {
            return this === $possibleParent[0];
        }).length > 0;
    }

    // Function to close all open nodes except the specified one and its parents
    function closeOtherNodes($currentToggle) {
        $('.post-parent > a.post-toggle').each(function() {
            const $toggle = $(this);
            const $ul = $toggle.nextAll("ul.post-children:first");
            
            if ($ul.is(":visible") && 
                $toggle[0] !== $currentToggle[0] && 
                !isParentOf($toggle, $currentToggle)) {
                
                if (!isParentOf($currentToggle, $toggle)) {
                    $toggle.html('<span class="dashicons dashicons-category"></span> <span>[+] ');
                    $ul.slideUp();
                    $toggle.data('state', 'closed');
                }
            }
        });
    }

    // Toggle a subtree
    function toggleSubtree($toggle) {
        const $ul = $toggle.nextAll("ul.post-children:first");

        if ($ul.is(":visible")) {
            // Close this subtree and all its children
            $toggle.html('<span class="dashicons dashicons-category"></span> <span>[+] ');
            $ul.slideUp();
            $ul.find('.post-parent > a.post-toggle').each(function() {
                const $childToggle = $(this);
                const $childUl = $childToggle.nextAll("ul.post-children:first");
                $childToggle.html('<span class="dashicons dashicons-category"></span> <span>[+] ');
                $childUl.slideUp();
                $childToggle.data('state', 'closed');
            });
            $toggle.data('state', 'closed');
            currentlyOpenNode = null;
        } else {
            // Close other open nodes (except parents)
            closeOtherNodes($toggle);

            // Open this subtree
            $toggle.html('<span class="dashicons dashicons-open-folder"></span> <span>[-] ');
            $ul.slideDown();
            $toggle.data('state', 'open');
            
            // Ensure all parent nodes stay open
            $toggle.parents('li.post-parent').each(function() {
                const $parentToggle = $(this).find('> a.post-toggle');
                const $parentUl = $parentToggle.nextAll("ul.post-children:first");
                $parentToggle.html('<span class="dashicons dashicons-open-folder"></span> <span>[-] ');
                $parentUl.slideDown();
                $parentToggle.data('state', 'open');
            });
            
            currentlyOpenNode = $toggle;
        }

        return false;
    }

    // Function to scroll to top with smooth animation
    function scrollToTop() {
        $('html, body').animate({
            scrollTop: 0
        }, 500);
    }

    // Toggle click handler using event delegation
    $(document).on('click', ".post-parent > a.post-toggle", function(e) {
        e.preventDefault();
        toggleSubtree($(this));
    });

 // Post link click handler
$('.custom-post-tree a:not(.post-toggle)').click(function(e) {
    e.preventDefault();
    const url = $(this).attr('href');
    const $clickedLink = $(this);

    // Remove active class from all post links and add it to the clicked one
    $('.custom-post-tree a').removeClass('active-post-link');
    $clickedLink.addClass('active-post-link');

    // Show loading state
    $clickedLink.css('opacity', '0.5');

    // AJAX load post
    $.get(url, function(data) {
        const $newContent = $(data).find(".entry");
        
        if ($newContent.length) {
            $('.entry').html($newContent.html());
            history.pushState(null, null, url);
            scrollToTop();
        } else {
            console.log("Error: Post content not found.");
        }

        $clickedLink.css('opacity', '1');
    }).fail(function() {
        console.log("Error loading post content");
        $clickedLink.css('opacity', '1');
    });
});


    // Handle browser back/forward
    $(window).on('popstate', function() {
        if (location.href !== initialURL) {
            $.get(location.href, function(data) {
                const $newContent = $(data).find(".entry");
                $('.entry').html($newContent.html());
                scrollToTop();
            });
        }
    });

    // Add file icon to leaf nodes
    $(".post-parent:not(:has(ul.post-children))").prepend('<span class="fileimg"></span> <span>');
});

