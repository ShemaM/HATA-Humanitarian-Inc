/**
 * @file loadHeader.js
 * @description Fetches, injects, and initializes the site-wide header component.
 * This script should be included in any HTML file that needs the main navigation bar.
 * It assumes a <header id="header-placeholder"></header> element exists in the HTML body.
 */

document.addEventListener('DOMContentLoaded', function () {
    // The path to your reusable header file.
    const headerURL = 'header.html';

    // The element where the header will be injected.
    const headerPlaceholder = document.getElementById('header-placeholder');

    if (!headerPlaceholder) {
        console.error('Error: No element with ID "header-placeholder" found. Cannot load header.');
        return;
    }

    // --- Step 1: Fetch the header HTML ---
    fetch(headerURL)
        .then(response => {
            // Check if the request was successful
            if (!response.ok) {
                throw new Error(`Network response was not ok. Status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            // --- Step 2: Inject the HTML into the placeholder ---
            headerPlaceholder.innerHTML = html;
            
            // --- Step 3: Initialize scripts for the newly added header ---
            initializeHeaderScripts();
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            // Provide a fallback message in the UI
            headerPlaceholder.innerHTML = '<p class="text-center text-danger bg-light p-3">Error: Could not load site navigation.</p>';
        });

    /**
     * Attaches event listeners and dynamic classes to the header component.
     * This function is called only after the header has been successfully fetched and injected.
     */
    function initializeHeaderScripts() {
        const navbar = document.querySelector('#header-placeholder .navbar');
        if (!navbar) return; // Exit if the navbar isn't found

        // --- Scroll Effect ---
        // Adds a shadow to the navbar when the user scrolls down.
        const handleScroll = () => {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll);

        // --- Active Link Logic ---
        // Determines the current page and applies the 'active' class to the correct nav link.
        const currentPath = window.location.pathname.split("/").pop();
        const navLinks = navbar.querySelectorAll('.nav-link');
        const dropdownItems = navbar.querySelectorAll('.dropdown-item');
        const programsDropdownLink = navbar.querySelector('#navbarDropdownPrograms');

        let onProgramSubPage = false;

        // Check if the current page is one of the program sub-pages
        dropdownItems.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                onProgramSubPage = true;
                link.classList.add('active'); // Highlight the specific program in the dropdown
            }
        });

        // If on a program sub-page, also highlight the main "Programs" dropdown link
        if (onProgramSubPage && programsDropdownLink) {
            programsDropdownLink.classList.add('active');
        } else {
            // Otherwise, find the matching top-level link
            navLinks.forEach(link => {
                // Check if it's not a dropdown toggle and if the href matches
                if (!link.classList.contains('dropdown-toggle') && link.getAttribute('href').endsWith(currentPath)) {
                    link.classList.add('active');
                }
            });
        }
    }
});
