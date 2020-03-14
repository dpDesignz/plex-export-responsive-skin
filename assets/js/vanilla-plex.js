/* eslint-disable no-undef */
/*!
 * Plex Export Vanilla js 0.1.2
 * https://github.com/dpDesignz/plex-export-responsive-skin
 * @license MIT licensed
 *
 * Copyright (C) 2020 dpDesignz
 *
 * This is still a work in progress
 */

const PLEX = {
  sections: {},
  total_items: 0,
  current_section: false,
  current_item: false,
  previous_item_id: 0,
  next_item_id: 0,
  current_sort_key: 'title',
  current_sort_order: 'asc',
  current_genre: 'all',
  current_director: 'all',
  show_all_genres: false,
  show_all_directors: false,
  data_loaded: false,
  filter_timeout: false,
  filter_delay: 350,
  popup_visible: false,
  last_updated: 'none',

  // Load the data
  load_data(aData) {
    // Check if aData is set
    if (
      !aData ||
      !aData.status ||
      aData.status !== 'success' ||
      aData.num_sections === 0
    )
      return false;
    // Loop through the sections from the obtained data
    Object.keys(aData.sections).forEach(sectionKey => {
      PLEX.sections[sectionKey] = aData.sections[sectionKey]; // Set each section
    });
    PLEX.total_items = aData.total_items; // Set the total items
    PLEX.section_display_order = aData.section_display_order; // Set the section display order
    PLEX.last_updated = aData.last_updated; // Set the last update dtm
    PLEX.data_loaded = true; // Set the data loaded bool
  }, // end func: load_data

  // Display the sections list
  display_sections_list() {
    // Init the section list html
    let sectionListHTML = '';
    // Loop through the section display order
    PLEX.section_display_order.forEach(key => {
      const section = PLEX.sections[key]; // Get the section data
      // Add to the section list html
      sectionListHTML += `<li data-section="${section.key}" class="${
        section.type
      }"><em>${number_format(section.num_items)}</em><span>${
        section.title
      }</span></li>`;
    });
    // Update the sections list inner HTML
    PLEX._sections_list.innerHTML = sectionListHTML;
  }, // end func: display_sections_list

  // Display a section
  display_section(sectionIDIn) {
    const sectionID = parseInt(sectionIDIn);

    if (sectionID !== PLEX.current_section.key) {
      // Reset the section data
      PLEX.current_sort_key = 'title';
      PLEX.current_sort_order = 'asc';
      PLEX.current_genre = 'all';
      PLEX.current_director = 'all';
      PLEX.current_seen = 'all';
      PLEX.show_all_directors = false;
      // Remove any set sort list current class
      PLEX._sorts_list.querySelectorAll('li.current').forEach(sortsListLi => {
        sortsListLi.classList.remove('current');
      });
      // Remove em tags from the sorts list
      PLEX._sorts_list.querySelectorAll('li em').forEach(sortsListLiEm => {
        sortsListLiEm.parentNode.removeChild(sortsListLiEm);
      });
      // Add the current class to the set sort element
      PLEX._sorts_list
        .querySelectorAll(`li[data-sort="${PLEX.current_sort_key}"]`)
        .forEach(dataSortItem => {
          if (!dataSortItem.classList.contains('current'))
            dataSortItem.classList.add('current');
          dataSortItem.insertAdjacentHTML(
            'beforeend',
            `<em>${PLEX.current_sort_order}</em>`
          );
        });
    }

    PLEX.current_section = PLEX.sections[sectionID];
    window.location.hash = PLEX.current_section.key;

    PLEX._sections_list.querySelectorAll('li').forEach(sectionsListLi => {
      if (sectionsListLi.classList.contains('current'))
        sectionsListLi.classList.remove('current');
    });
    document
      .querySelectorAll(`li[data-section="${sectionID}"]`)
      .forEach(dataSectionItem => {
        if (!dataSectionItem.classList.contains('current'))
          dataSectionItem.classList.add('current');
      });
    PLEX._section_title.innerText = PLEX.current_section.title;

    // Output the items
    PLEX.display_items();

    // Output the genre list
    PLEX.display_genre_list(PLEX.current_section.genres);

    const itemsToShowDirectorsFor = PLEX.filter_items_by_genre(
      PLEX.current_section.items,
      PLEX.current_genre
    );
    const directors = [];
    let itemCount = 0;

    // Sort through list of directors
    Object.keys(itemsToShowDirectorsFor).forEach(key => {
      // Set item
      const item = itemsToShowDirectorsFor[key];

      // Check if director is set
      if (!item.director) return;

      // Increment item count
      itemCount += 1;

      // Add director to the array
      item.director.forEach(name => {
        if (name) {
          let director = directors[name];
          if (!director) {
            director = { director: name, count: 0 };
            directors.push(director);
            directors[name] = director;
          }
          director.count += 1;
        }
      });
    });

    // Sort the directors
    directors.sort(function(a, b) {
      if (a.count > b.count) return -1;

      if (a.count < b.count) return 1;

      if (a.director > b.director) return -1;

      if (a.director < b.director) return 1;

      return 0;
    });

    // Output the list of directors
    PLEX.display_director_list(itemCount, directors);

    // Output the list of seen items
    PLEX.display_seen_list('all');
  }, // end func: display_section

  // Display the genre list
  display_genre_list(genres) {
    // Check if there are any genres set
    if (genres.length === 0) {
      // There are no genres. Hide the genres list section
      PLEX._genre_list_section.style.display = 'none';
      return;
    }

    const numToShowBeforeHiding = 5; // Set how many genres to show before hiding the rest
    let count = 0; // Init how many genres there are
    let numHidden = 0; // Init how many rows are hidden
    let listHTML = `<li data-genre="all"><em>${PLEX.current_section.num_items}</em>All</li>`; // Init the list html

    // Loop through each genre
    genres.forEach(genre => {
      count += 1; // Increment the total genre count
      // Check if needing to hide the genre
      if (count <= numToShowBeforeHiding) {
        // Add genre to the list html
        listHTML += `<li data-genre="${genre.genre}" class="genre_shown"><em>${genre.count}</em>${genre.genre}</li>`;
      } else {
        // Hide the genre
        numHidden += 1; // Increment hidden genres count
        // Add genre to the list html
        listHTML += `<li data-genre="${genre.genre}" class="genre_hidden"><em>${genre.count}</em>${genre.genre}</li>`;
      }
    });

    // Check if there are any hidden genres
    if (numHidden > 0) {
      // Output show and hide elements
      listHTML += `<li id="genre_show_all">Show ${numHidden} more...</li>`;
      listHTML += `<li id="genre_hide_all">Show fewer...</li>`;
    }

    // Update the genre list inner HTML
    PLEX._genre_list.innerHTML = listHTML;

    // Check if wanting to show all genres
    if (PLEX.show_all_genres) {
      // Hide the show all element
      const genreShowAll = document.querySelector('#genre_show_all');
      if (genreShowAll) {
        genreShowAll.style.display = 'none';
      }
      // Show all hidden genres
      document.querySelectorAll('.genre_hidden').forEach(genreHiddenElm => {
        genreHiddenElm.style.display = 'grid';
      });
    } else {
      // Hide hidden genres
      // Hide the hide all element
      const genreHideAll = document.querySelector('#genre_hide_all');
      if (genreHideAll) {
        genreHideAll.style.display = 'none';
      }
      // Hide all hidden genres
      document.querySelectorAll('.genre_hidden').forEach(genreHiddenElm => {
        genreHiddenElm.style.display = 'none';
      });
    }

    // Remove current class from current genre
    PLEX._genre_list.querySelectorAll('li.current').forEach(genreListLi => {
      genreListLi.classList.remove('current');
    });

    // Add current class to new current genre
    document
      .querySelectorAll(`li[data-genre="${PLEX.current_genre}"]`)
      .forEach(dataGenreLi => {
        if (!dataGenreLi.classList.contains('current'))
          dataGenreLi.classList.add('current');
      });

    // Show the genre list section
    PLEX._genre_list_section.style.display = 'block';
  }, // end func: display_genre_list

  // Display the director list
  display_director_list(totalCount, directors) {
    // Check if there are any directors set
    if (directors.length === 0) {
      // There are no directors. Hide the director list section
      PLEX._director_list_section.style.display = 'none';
      return;
    }

    const numToShowBeforeHiding = 5; // Set how many directors to show before hiding the rest
    let count = 0; // Init how many directors there are
    let numHidden = 0; // Init how many rows are hidden
    let listHtml = `<li data-director="all"><em>${totalCount}</em>All</li>`; // Init the list html

    // Loop through each director
    directors.forEach(director => {
      count += 1; // Increment the total director count
      // Check if needing to hide the director
      if (count <= numToShowBeforeHiding) {
        // Add director to the list html
        listHtml += `<li data-director="${director.director}" class="director_shown"><em>${director.count}</em>${director.director}</li>`;
      } else {
        // Hide the director
        numHidden += 1; // Increment hidden director count
        // Add director to the list html
        listHtml += `<li data-director="${director.director}" class="director_hidden"><em>${director.count}</em>${director.director}</li>`;
      }
    });

    // Check if there are any hidden genres
    if (numHidden > 0) {
      // Output show and hide elements
      listHtml += `<li id="director_show_all">Show ${numHidden} more...</li>`;
      listHtml += `<li id="director_hide_all">Show fewer...</li>`;
    }

    // Update the director list inner HTML
    PLEX._director_list.innerHTML = listHtml;

    // Check if wanting to show all directors
    if (PLEX.show_all_directors) {
      // Hide the show all element
      const directorShowAll = document.querySelector('#director_show_all');
      if (directorShowAll) {
        directorShowAll.style.display = 'none';
      }
      // Show all hidden directors
      document
        .querySelectorAll('.director_hidden')
        .forEach(directorHiddenElm => {
          directorHiddenElm.style.display = 'grid';
        });
    } else {
      // Hide hidden directors
      // Hide the hide all element
      const directorHideAll = document.querySelector('#director_hide_all');
      if (directorHideAll) {
        directorHideAll.style.display = 'none';
      }
      // Hide all hidden directors
      document
        .querySelectorAll('.director_hidden')
        .forEach(directorHiddenElm => {
          directorHiddenElm.style.display = 'none';
        });
    }

    // Remove current class from current director
    PLEX._director_list
      .querySelectorAll('li.current')
      .forEach(directorListLi => {
        directorListLi.classList.remove('current');
      });

    // Add current class to new current director
    document
      .querySelectorAll(`li[data-director="${PLEX.current_director}"]`)
      .forEach(dataDirectorLi => {
        if (!dataDirectorLi.classList.contains('current'))
          dataDirectorLi.classList.add('current');
      });

    // Show the director list section
    PLEX._director_list_section.style.display = 'block';
  }, // end func: display_director_list

  // Display the seen list
  display_seen_list(seen) {
    // Check the current section type isn't a movie
    if (PLEX.current_section.type !== 'movie') {
      // Hide the seen list section
      PLEX._seen_list_section.style.display = 'none';
      return;
    }

    // Init the list html
    let listHTML = `<li data-seen="all"><em>${PLEX.current_section.num_items}</em>All</li>`;

    // Init the seen count
    let seenCount = 0;

    // Loop through seen items
    Object.keys(
      PLEX.filter_items_by_seen(PLEX.current_section.items, 'true')
    ).forEach(() => {
      seenCount += 1;
    });

    // Add seen items to the list html
    listHTML += `<li data-seen="true"><em>${seenCount}</em>Seen</li>`;

    // Init the unseen count
    let unseenCount = 0;

    // Loop through unseen items
    Object.keys(
      PLEX.filter_items_by_seen(PLEX.current_section.items, 'false')
    ).forEach(() => {
      unseenCount += 1;
    });

    // Add the unseen items to the list html
    listHTML += `<li data-seen="false"><em>${unseenCount}</em>Not Seen</li>`;

    // Set the seen list inner HTML
    PLEX._seen_list.innerHTML = listHTML;

    // Remove the current class from the seen list
    PLEX._seen_list.querySelectorAll('li.current').forEach(seenListLi => {
      seenListLi.classList.remove('current');
    });

    // Add current class to new current seen
    document
      .querySelectorAll(`li[data-seen="${PLEX.current_seen}"]`)
      .forEach(dataSeenLi => {
        if (!dataSeenLi.classList.contains('current'))
          dataSeenLi.classList.add('current');
      });

    // Show the seen list section
    PLEX._seen_list_section.style.display = 'block';
  }, // end func: display_seen_list

  // TODO Find out what trigger scroll is used for
  // Display items
  display_items() {
    // Init items as current section
    let { items } = PLEX.current_section;

    // Check if current seen is not "all"
    if (PLEX.current_seen !== 'all') {
      // Set items filtered as current seen
      items = PLEX.filter_items_by_seen(items, PLEX.current_seen);
    }

    // Check if there is a filter value set
    if (PLEX._section_filter.value !== '') {
      // Set items filtered as filter value match
      items = PLEX.filter_items_by_term(items, PLEX._section_filter.value);
    }

    // Check that current genre isn't "all"
    if (PLEX.current_genre !== 'all') {
      // Set items filtered as current genre
      items = PLEX.filter_items_by_genre(items, PLEX.current_genre);
    }

    // Check current director isn't "all"
    if (PLEX.current_director !== 'all') {
      // Set items filtered as current director
      items = PLEX.filter_items_by_director(items, PLEX.current_director);
    }

    // Reset the item list inner HTML
    PLEX._item_list.innerHTML = '';

    let numItems = 0; // Init the number of items
    let innerHTML = ''; // Init the inner HTML

    // Loop through the current section sorts
    PLEX.current_section.sorts[
      `${PLEX.current_sort_key}_${PLEX.current_sort_order}`
    ].forEach(key => {
      // If the item is undefined, skip
      if (typeof items[key] === 'undefined') return;
      const item = items[key]; // Set the item
      const thumb =
        item.thumb === false ? 'assets/images/default.png' : item.thumb; // Set the thumb

      // Set the data to the innerHTML
      innerHTML += `<li data-item="${item.key}" class="item"><img src="${thumb}" width="150" /><main><h4>${item.title}</h4></main></li>`;

      numItems += 1; // Increment the number of items
    });

    // Update the item list inner HTML
    PLEX._item_list.innerHTML = innerHTML;

    // Check if there are no items
    if (numItems === 0) {
      PLEX._section_meta.innerText = 'No items in this collection'; // Update the section meta inner text
      PLEX._item_list_status.innerHTML =
        '<p>There are no items to display in this collection that matches the filters set.</p>'; // Update the item list status inner html
      PLEX._item_list_status.style.display = 'block'; // Show the item list status section
    } else {
      // There are items
      // Hide the item list status
      PLEX._item_list_status.style.display = 'none';
      // Set the section meta inner text
      PLEX._section_meta.innerText = `${number_format(numItems)} ${inflect(
        numItems,
        'item'
      )} in this collection`;
    }

    // $(document).trigger("scroll");
  }, // end func: display_items

  // Filter items by term
  filter_items_by_term(allItems, termIn) {
    // Init the term as lowercase value
    const term = termIn.toLowerCase();

    // Check if the term value is blank and return all items if it is
    if (term === '') return allItems;

    // Init items to sho
    const itemsToShow = {};

    // Loop through all items
    Object.keys(allItems).forEach(key => {
      // Set the current item title as lowercase
      const title = allItems[key].title.toLowerCase();
      // Check if the term is matched in the title and skip if not
      if (title.indexOf(term) === -1) return;
      // Add item to items to show
      itemsToShow[key] = allItems[key];
    });

    // Return items to show
    return itemsToShow;
  }, // end func: filter_items_by_term

  // Filter items by genre
  filter_items_by_genre(allItems, genre) {
    // Check if the genre is "all" and return all items if it is
    if (genre === 'all') return allItems;

    // Init items to show
    const itemsToShow = {};

    // Loop through all items
    Object.keys(allItems).forEach(key => {
      // Check if the genre is in the array and skip if not
      if (!allItems[key].genre || !allItems[key].genre.includes(genre)) return;
      // Add item to items to show
      itemsToShow[key] = allItems[key];
    });

    // Return items to show
    return itemsToShow;
  }, // end func: filter_items_by_genre

  // Filter items by director
  filter_items_by_director(allItems, director) {
    // Check if the director is "all" and return all items if it is
    if (director === 'all') return allItems;

    // Init items to show
    const itemsToShow = {};

    // Loop through all items
    Object.keys(allItems).forEach(key => {
      // Check if the director is in the array and skip if not
      if (!allItems[key].director || !allItems[key].director.includes(director))
        return;
      // Add item to items to show
      itemsToShow[key] = allItems[key];
    });

    // Return items to show
    return itemsToShow;
  }, // end func: filter_items_by_director

  // Filter items by seen
  filter_items_by_seen(allItems, seen) {
    // Check if seen is set to "all" and return all items if it is
    if (seen === 'all') return allItems;

    // Init items to show
    const itemsToShow = {};

    // Loop through all items
    Object.keys(allItems).forEach(key => {
      // Check if seen is set to true and the view count is 0, skip if true
      if (seen === 'true' && allItems[key].view_count === 0) return;
      // Check if seen is set to false and the view count is greater than 0, skip if true
      if (seen === 'false' && allItems[key].view_count > 0) return;
      // Add item to items to show
      itemsToShow[key] = allItems[key];
    });

    // Return items to show
    return itemsToShow;
  },

  // Change sort
  change_sort(argNewSortKey) {
    // Init the new sort key as title
    let newSortKey = 'title';

    // Check for match on argNewSortKey
    switch (argNewSortKey) {
      case 'release': // Check for and set sort key as release
        newSortKey = 'release';
        break;
      case 'rating': // Check for and set sort key as rating
        newSortKey = 'rating';
        break;
      case 'addedAt': // Check for and set sort key as added at
        newSortKey = 'addedAt';
        break;
      default:
        // Fall back to default value
        newSortKey = 'title';
        break;
    }

    // Check if the new sort key is the same as the current sort key
    if (newSortKey === PLEX.current_sort_key) {
      // Check for and set the sort order
      PLEX.current_sort_order =
        PLEX.current_sort_order === 'desc' ? 'asc' : 'desc';
    } else {
      // Sort key is different. Set new sort key
      PLEX.current_sort_key = newSortKey;
    }

    // Remove the current class from the sorts list
    PLEX._sorts_list.querySelectorAll('li.current').forEach(sortsListLi => {
      sortsListLi.classList.remove('current');
    });

    // Remove em tags from the sorts list
    PLEX._sorts_list.querySelectorAll('li em').forEach(sortsListLiEm => {
      sortsListLiEm.parentNode.removeChild(sortsListLiEm);
    });

    // Add the current class to the set sort element
    PLEX._sorts_list
      .querySelectorAll(`li[data-sort="${PLEX.current_sort_key}"]`)
      .forEach(dataSortItem => {
        if (!dataSortItem.classList.contains('current'))
          dataSortItem.classList.add('current');
        dataSortItem.insertAdjacentHTML(
          'beforeend',
          `<em>${PLEX.current_sort_order}</em>`
        );
      });

    // Display the newly sorted section
    PLEX.display_section(PLEX.current_section.key);
  }, // end func: change_sort

  // Change genre
  change_genre(genre) {
    // Check if the genre is set and skip if not
    if (typeof genre === 'undefined' || genre === PLEX.current_genre) return;

    // Set the current director to all
    PLEX.current_director = 'all';

    // Set the new current genre
    PLEX.current_genre = genre;

    // Display the new section genre selection
    PLEX.display_section(PLEX.current_section.key);
  }, // end func: change_genre

  // Change director
  change_director(director) {
    // Check if the director is set and skip if not
    if (typeof director === 'undefined' || director === PLEX.current_director)
      return;

    // Set the new current director
    PLEX.current_director = director;

    // Display the new section director selection
    PLEX.display_section(PLEX.current_section.key);
  }, // end func: change_director

  // Change seen
  change_seen(seen) {
    // Check if seen is set and skip if not
    if (typeof seen === 'undefined' || seen === PLEX.current_seen) return;

    // Set the new seen value
    PLEX.current_seen = seen;

    // Display the new section with the set seen value
    PLEX.display_section(PLEX.current_section.key);
  },

  // Display item
  display_item(itemIDIn) {
    // Set item ID as int
    const itemID = parseInt(itemIDIn);

    // Set the current item by the item ID
    PLEX.current_item = PLEX.current_section.items[itemID];

    // Set the window location hash
    window.location.hash = `${PLEX.current_section.key}/${PLEX.current_item.key}`;

    // Set the popup HTML
    const popupHTML = PLEX.generate_item_content();

    // Fade in the popup overlay
    FX.fadeIn(PLEX._popup_overlay, {
      duration: 400,
      setTo: 0.6,
      complete: null,
    });

    // Set the popup height and display
    PLEX._popup_overlay.style.height = `${document.body.scrollHeight}px`;

    // Set popup container HTML
    PLEX._popup_container.innerHTML = popupHTML;

    // Set popup container styling
    PLEX._popup_container.style.opacity = 0;
    PLEX._popup_container.style.display = 'block';
    PLEX._popup_container.style.top = `${document.documentElement.scrollTop +
      (document.documentElement.clientHeight -
        PLEX._popup_container.offsetHeight) /
        2}px`;
    PLEX._popup_container.style.left = `${(document.body.offsetWidth -
      PLEX._popup_container.offsetWidth) /
      2}px`;

    // Fade in popup container
    FX.fadeIn(PLEX._popup_container);
  }, // end func: display_item

  generate_item_content() {
    // Set popup header
    const popupHeader = `<div id="popup-header"><p>Library &raquo; ${PLEX.current_section.title} &raquo; ${PLEX.current_item.title}</p><p><span class="popup-close">Close</span></p></div>`;

    // Get current item element
    const currentItem = PLEX._item_list.querySelector(
      `li[data-item="${PLEX.current_item.key}"]`
    );

    // Get previous item
    const previousItemID = currentItem.previousSibling
      ? parseInt(currentItem.previousSibling.dataset.item)
      : 0;

    // Get next item
    const nextItemID = currentItem.nextSibling
      ? parseInt(currentItem.nextSibling.dataset.item)
      : 0;

    PLEX.previous_item_id = previousItemID > 0 ? previousItemID : 0; // Check previous item ID
    PLEX.next_item_id = nextItemID > 0 ? nextItemID : 0; // Check next item ID

    // Init the popup footer
    let popupFooter = '<div id="popup-footer">';
    // Check if the previous item ID is set and append to footer if it is
    if (previousItemID > 0)
      popupFooter += `<span class="previous-item" data-item="${PLEX.current_section.items[previousItemID].key}">&laquo; ${PLEX.current_section.items[previousItemID].title}</span>`;

    // Check if next item ID is set and append to footer if it is
    if (nextItemID > 0)
      popupFooter += `<span class="next-item" data-item="${PLEX.current_section.items[nextItemID].key}">${PLEX.current_section.items[nextItemID].title} &raquo;</span></div>`;

    // Clear popup footer direction buttons
    popupFooter += '<div class="clear"></div></div>';

    const _img = currentItem.querySelector('img'); // Get the current item image
    let imgHeight = ''; // Init the image height
    // Check if the image dataset-src is set
    if (_img.dataset.src !== undefined) {
      _img.src = _img.dataset.src; // Set the image source
      _img.removeAttr('data-src'); // Remove the dataset-src
    } else {
      // dataset-src isn't set. Get image height
      imgHeight = _img.height; // Set the image height
    }

    // Set the image thumb
    const imgThumb = _img.src;

    // Init the popup sidebar meta
    let popupSidebarMeta = '<ul>';

    // Check if the current item has a duration set
    if (PLEX.current_item.duration > 0) {
      const minutes = Math.round(PLEX.current_item.duration / 60000); // Set the item minutes

      // Add duration to the popup sidebar meta
      popupSidebarMeta += `<li><strong>Duration:</strong> ${minutes} ${inflect(
        minutes,
        'minute'
      )}</li>`;
    }

    // Check if the current item has a studio set and add it to the popup sidebar meta
    if (PLEX.current_item.studio !== false)
      popupSidebarMeta += `<li><strong>Studio:</strong> ${PLEX.current_item.studio}</li>`;

    // Check if the current item has a release year set and add it to the popup sidebar meta
    if (PLEX.current_item.release_year !== false)
      popupSidebarMeta += `<li><strong>Released:</strong> ${PLEX.current_item.release_year}</li>`;

    // Check if the current item has a content rating set and add it to the popup sidebar meta
    if (PLEX.current_item.content_rating !== false)
      popupSidebarMeta += `<li><strong>Rated:</strong> ${PLEX.current_item.content_rating}</li>`;

    // Check if the current item has multiple seasons set and add it to the popup sidebar meta
    if (PLEX.current_item.num_seasons > 0)
      popupSidebarMeta += `<li><strong>Seasons:</strong> ${PLEX.current_item.num_seasons}</li>`;

    // Check if the current item has multiple episodes set and add it to the popup sidebar meta
    if (PLEX.current_item.num_episodes > 0)
      popupSidebarMeta += `<li><strong>Episodes:</strong> ${PLEX.current_item.num_episodes}</li>`;

    // Check if the current item has a view count set and add it to the popup sidebar meta
    if (PLEX.current_item.view_count > 0)
      popupSidebarMeta += `<li><strong>Watched:</strong> ${
        PLEX.current_item.view_count
      } ${inflect(PLEX.current_item.view_count, 'time')}</li>`;

    // Close the popup sidebar meta
    popupSidebarMeta += '</ul>';

    // Init the popup sidebar
    const popupSidebar = `<div id="popup-sidebar"><img src="${imgThumb}" />${popupSidebarMeta}</div>`;

    // Init the rating tag
    let ratingTag = '';

    // Check if there is a user rating set
    if (PLEX.current_item.user_rating !== false) {
      const rating = PLEX.current_item.user_rating; // Set the user rating
      const ratingSource = 'user'; // Set the rating source
    } else if (PLEX.current_item.rating !== false) {
      // Check if there is a rating set
      const { rating } = PLEX.current_item; // Set the plex rating
      const ratingSource = 'plex'; // Set the rating source
    }

    // Check if there is any rating set
    if (typeof rating !== 'undefined') {
      // Init the rating class
      const ratingClass = `rating_${(Math.round(rating) / 2) * 10}`;
      // Set the rating tag
      ratingTag = `<span class="rating rating_${ratingSource} ${ratingClass}"></span>`;
    } // end RATING

    // Init the popup content
    let popupContent = `<div id="popup-content"><header><h3>${PLEX.current_item.title}</h3>${ratingTag}</header>`;

    // Check if there is a tagline and add it to the popup content
    if (PLEX.current_item.tagline !== false)
      popupContent += `<h4>${PLEX.current_item.tagline}</h4>`;

    // Check if there is a summary and add it to the popup content
    if (PLEX.current_item.summary !== false)
      popupContent += `<div id="popup-summary"><p>${PLEX.current_item.summary}</p></div>`;

    // Check if there are any directors, genres, roles, or media
    if (
      (PLEX.current_item.director && PLEX.current_item.director.length > 0) ||
      (typeof PLEX.current_item.genre !== 'undefined' &&
        PLEX.current_item.genre.length > 0) ||
      (PLEX.current_item.role && PLEX.current_item.role.length > 0) ||
      PLEX.current_item.media
    ) {
      // Start popup content meta
      popupContent += '<ul id="popup-content-meta">';

      // Check if there are any directors and add them to the popup content
      if (PLEX.current_item.director)
        popupContent += `<li><strong>Directed by:</strong> ${PLEX.current_item.director.join(
          ', '
        )}</li>`;

      // Check if there are any roles and add them to the popup content
      if (PLEX.current_item.role)
        popupContent += `<li><strong>Starring:</strong> ${PLEX.current_item.role.join(
          ', '
        )}</li>`;

      // Check if there are any genres and add them to the popup content
      if (PLEX.current_item.genre)
        popupContent += `<li><strong>Genre:</strong> ${PLEX.current_item.genre.join(
          ', '
        )}</li>`;

      // Check if there is any media
      if (PLEX.current_item.media) {
        // Init media
        const { media } = PLEX.current_item;

        // Add video data to the popup content meta
        popupContent += `<li><strong>Video:</strong> codec: ${
          media.video_codec
        }, framerate: ${media.video_framerate}${
          media.video_resolution !== undefined && media.video_resolution > 0
            ? `, vert: ${media.video_resolution}`
            : ''
        }${
          media.aspect_ratio !== undefined && media.aspect_ratio > 0
            ? `, aspect ratio: ${media.aspect_ratio}`
            : ''
        }</li>`;

        // Add audio data to the popup content meta
        popupContent += `<li><strong>Audio:</strong> codec: ${media.audio_codec}, channels: ${media.audio_channels}</li>`;

        // Check if the total size is set and add it to the popup content meta
        if (media.total_size !== false)
          popupContent += `<li><strong>File:</strong> ${hl_bytes_to_human(
            media.total_size
          )} @ ${media.bitrate}bps</li>`;
      }

      // Close the popup content meta
      popupContent += '</ul>';
    } // end CONTENT META

    // Check if there is any seasons
    if (PLEX.current_item.num_seasons && PLEX.current_item.num_seasons > 0) {
      // Start the season browser
      popupContent += `<div id="popup_seasons"><h4>Season Browser</h4><article><section id="popup_seasons_seasons"><ul>`;

      // Loop through the seasons
      $.each(PLEX.current_item.season_sort_order, function(i, key) {
        const season = PLEX.current_item.seasons[key];
        popupContent += `<li data-season="${season.key}">${season.title}</li>`;
      });

      // Start the season episodes
      popupContent += `</ul></section><section id="popup_seasons_episodes"></section><section id="popup_seasons_episode"></section></article></div>`;

      $('#popup_seasons_seasons li').live('click', function() {
        $('#popup_seasons_seasons li').removeClass('current');
        $(this).addClass('current');
        const season_key = $(this).attr('data-season');
        const season = PLEX.current_item.seasons[season_key];
        let html = '<ul>';
        $.each(season.episode_sort_order, function(i, key) {
          const episode = season.episodes[key];
          html += `<li data-season="${season.key}" data-episode="${episode.key}">${episode.index}. ${episode.title}</li>`;
        });
        html += '</ul>';
        $('#popup_seasons_episodes').html(html);
      });

      $('#popup_seasons_episodes li').live('click', function() {
        $('#popup_seasons_episodes li').removeClass('current');
        $(this).addClass('current');
        const season_key = $(this).attr('data-season');
        const episode_key = $(this).attr('data-episode');
        const season = PLEX.current_item.seasons[season_key];
        const episode = season.episodes[episode_key];
        const minutes = Math.round(episode.duration / 60000);
        const html = `<h5>${episode.title}</h5><p class="meta">${episode_tag(
          season,
          episode
        )} | ${minutes} ${inflect(minutes, 'minute')} | Rated ${
          episode.rating
        }</p><p>${episode.summary}</p>`;
        $('#popup_seasons_episode').html(html);
      });
    } // end SEASON BROWSER

    popupContent += '</div>';

    return `${popupHeader}<div id="popup-outer"><div id="popup-inner">${popupSidebar}${popupContent}<div class="clear"></div></div>${popupFooter}</div>`;
  }, // end func: generate_item_content

  // Hide item
  hide_item() {
    PLEX.popup_visible = false; // Set popup visible to false
    window.location.hash = PLEX.current_section.key; // Set hash to current section
    FX.fadeOut(PLEX._popup_overlay); // Fade out popup overlay
    FX.fadeOut(PLEX._popup_container); // Fade out popup container
  }, // end func: hide_item

  run() {
    if (!PLEX.data_loaded) {
      // No data loaded. Fetch data file
      fetch('plex-data/data.js')
        .then(response => {
          // Handle data
          if (response.ok) {
            response.text().then(data => {
              eval(data); // unpack
              PLEX.load_data(raw_plex_data);
              return PLEX.run();
            });
          } else {
            throw new Error(
              `Error obtaining the Plex data: ${response.statusText}`
            );
          }
        })
        .catch(error => {
          // Handle error
          console.error(error);
        });
      return;
    }

    // Get/Set Elements
    PLEX._total_items = document.querySelector('#total_items');
    PLEX._last_updated = document.querySelector('#last_updated');
    PLEX._sections_list = document.querySelector('#plex_section_list');
    PLEX._sorts_list = document.querySelector('#plex_sort_list');
    PLEX._genre_list_section = document.querySelector(
      '#plex_genre_list_section'
    );
    PLEX._genre_list_section.style.display = 'none';
    PLEX._genre_list = document.querySelector('#plex_genre_list');
    PLEX._director_list_section = document.querySelector(
      '#plex_director_list_section'
    );
    PLEX._director_list_section.style.display = 'none';
    PLEX._director_list = document.querySelector('#plex_director_list');
    PLEX._seen_list_section = document.querySelector('#plex_seen_list_section');
    PLEX._seen_list = document.querySelector('#plex_seen_list');
    PLEX._section_title = document.querySelector('#section-header h2');
    PLEX._section_meta = document.querySelector('#section-header p');
    PLEX._section_filter = document.querySelector('#section-header input');
    PLEX._item_list_status = document.querySelector('#item-list-status');
    PLEX._item_list = document.querySelector('#item-list ul');
    PLEX._popup_overlay = document.querySelector('#popup-overlay');
    PLEX._popup_container = document.querySelector('#popup-container');

    // Set page variables
    PLEX._total_items.innerText = number_format(PLEX.total_items);
    PLEX._last_updated.innerText = PLEX.last_updated;
    PLEX.display_sections_list();

    // Add event listeners
    PLEX._sections_list.querySelectorAll('li').forEach(sectionsListItem =>
      sectionsListItem.addEventListener('click', () => {
        PLEX.display_section(sectionsListItem.dataset.section);
      })
    );

    $('li', PLEX._sorts_list).click(function() {
      PLEX.change_sort($(this).attr('data-sort'));
    });

    $('li', PLEX._genre_list).live('click', function() {
      PLEX.change_genre($(this).attr('data-genre'));
    });

    $('li', PLEX._director_list).live('click', function() {
      PLEX.change_director($(this).attr('data-director'));
    });

    $('li', PLEX._seen_list).live('click', function() {
      PLEX.change_seen($(this).attr('data-seen'));
    });

    $('#genre_show_all').live('click', function() {
      PLEX.show_all_genres = true;
      $('.genre_hidden').show();
      $('#genre_show_all').hide();
      $('#genre_hide_all').show();
    });

    $('#genre_hide_all').live('click', function() {
      PLEX.show_all_genres = false;
      $('.genre_hidden').hide();
      $('#genre_hide_all').hide();
      $('#genre_show_all').show();
    });

    $('#director_show_all').live('click', function() {
      PLEX.show_all_directors = true;
      $('.director_hidden').show();
      $('#director_show_all').hide();
      $('#director_hide_all').show();
    });

    $('#director_hide_all').live('click', function() {
      PLEX.show_all_directors = false;
      $('.director_hidden').hide();
      $('#director_hide_all').hide();
      $('#director_show_all').show();
    });

    // Keyup on filter input
    PLEX._section_filter.addEventListener('keyup', () => {
      PLEX.display_section(PLEX.current_section.key);
    });

    $('li', PLEX._item_list).live('click', function() {
      PLEX.display_item($(this).attr('data-item'));
    });

    $('#popup-footer span').live('click', function() {
      PLEX.display_item($(this).attr('data-item'));
    });

    PLEX._popup_overlay.click(function() {
      PLEX.hide_item();
    });

    $(document).keyup(function(event) {
      if (event.shiftKey || event.metaKey || event.altKey || event.ctrlKey)
        return;
      switch (event.which) {
        case 27: // esc
        case 88: // x
          PLEX.hide_item();
          break;
        case 75: // k
          if (PLEX.previous_item_id > 0) {
            PLEX.display_item(PLEX.previous_item_id);
          }
          break;
        case 74: // j
          if (PLEX.next_item_id > 0) {
            PLEX.display_item(PLEX.next_item_id);
          } else if (!PLEX.popup_visible) {
            // Show first item if none others
            const first_item = parseInt(
              $(':first', PLEX._item_list).attr('data-item')
            );
            if (first_item > 0) PLEX.display_item(first_item);
          }
          break;
      }
    });

    $('.popup-close').live('click', function() {
      PLEX.hide_item();
    });

    $('#toggle_sidebar').click(function() {
      $('#sidebar-menu').toggle();
      if ($('#toggle_sidebar').html() == 'Close Menu') {
        $('#toggle_sidebar').html('Menu');
      } else {
        $('#toggle_sidebar').html('Close Menu');
      }
      return false;
    });

    const { hash } = window.location;
    if (hash != '') {
      const regex = new RegExp('#([0-9]+)/?([0-9]+)?/?');
      const m = regex.exec(hash);
      const m1 = parseInt(m[1]);
      const m2 = parseInt(m[2]);
      if (m1 > 0) PLEX.display_section(m1);
      if (m2 > 0) PLEX.display_item(m2);
    } else {
      $('li:first', PLEX._sections_list).click();
    }
  }, // end func: run
}; // end class: PLEX
