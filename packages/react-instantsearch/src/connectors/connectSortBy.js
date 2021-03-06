import { PropTypes } from 'react';
import {
  cleanUpValue,
  refineValue,
  getCurrentRefinementValue,
} from '../core/indexUtils';

import createConnector from '../core/createConnector';

function getId() {
  return 'sortBy';
}

function getCurrentRefinement(props, searchState, context) {
  const id = getId(props);
  return getCurrentRefinementValue(
    props,
    searchState,
    context,
    id,
    null,
    currentRefinement => {
      if (currentRefinement) {
        return currentRefinement;
      }
      return null;
    }
  );
}

/**
 * connectSortBy connector provides the logic to build a widget that will
 *  displays a list of indexes allowing a user to change the hits are sorting.
 * @name connectSortBy
 * @requirements Algolia handles sorting by creating replica indices. [Read more about sorting](https://www.algolia.com/doc/guides/relevance/sorting/) on
 * the Algolia website.
 * @kind connector
 * @propType {string} defaultRefinement - The default selected index.
 * @propType {{value: string, label: string}[]} items - The list of indexes to search in.
 * @propType {function} [transformItems] - Function to modify the items being displayed, e.g. for filtering or sorting them. Takes an items as parameter and expects it back in return.
 * @providedPropType {function} refine - a function to remove a single filter
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding search state
 * @providedPropType {string[]} currentRefinement - the refinement currently applied
 * @providedPropType {array.<{isRefined: boolean, label?: string, value: string}>} items - the list of items the HitsPerPage can display.  If no label provided, the value will be displayed.
 */
export default createConnector({
  displayName: 'AlgoliaSortBy',

  propTypes: {
    defaultRefinement: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string.isRequired,
      })
    ).isRequired,
    transformItems: PropTypes.func,
  },

  getProvidedProps(props, searchState) {
    const currentRefinement = getCurrentRefinement(
      props,
      searchState,
      this.context
    );
    const items = props.items.map(
      item =>
        item.value === currentRefinement
          ? { ...item, isRefined: true }
          : { ...item, isRefined: false }
    );
    return {
      items: props.transformItems ? props.transformItems(items) : items,
      currentRefinement,
    };
  },

  refine(props, searchState, nextRefinement) {
    const id = getId();
    const nextValue = { [id]: nextRefinement };
    const resetPage = true;
    return refineValue(searchState, nextValue, this.context, resetPage);
  },

  cleanUp(props, searchState) {
    return cleanUpValue(searchState, this.context, getId());
  },

  getSearchParameters(searchParameters, props, searchState) {
    const selectedIndex = getCurrentRefinement(
      props,
      searchState,
      this.context
    );
    return searchParameters.setIndex(selectedIndex);
  },

  getMetadata() {
    return { id: getId() };
  },
});
