import React from 'react';
import Select, { Creatable } from 'react-select';

const PropTypes = React.PropTypes;

const RecentSearches = ({ sok, onSearch, searchTerm, setSearchTerm }) => {
  const { recentSearches } = sok;
  const recent = recentSearches.get();
  const options = recent.map(val => ({ value: val, label: val }))

  return (
    <div>
      <form className='form sok' onSubmit={(ev) => { ev.preventDefault(); onSearch(searchTerm); } }>
        <div className='form-item sok-item'>
          <label htmlFor='sokefelt'>Søk etter stoppested</label>
          <Creatable
            options={options}
            value={searchTerm}
            onInputChange={val => { setSearchTerm(val); return val; }}
            onChange={(val) => setSearchTerm(val.value)}
            isValidNewOption={({ label }) => { 
              // setSearchTerm(label); onSearch(label);
              console.log('isValidNewOption', label); 
              return true; 
            }}
            autofocus={true}
          />
        </div>
        <div className='form-item sok-item'>
          <label id='sok-btn-label' htmlFor='go-sok'>&nbsp;</label>
          <input id='go-sok' type='submit' className='button-primary u-full-width' value='Finn stopp!' />
        </div>
      </form>
    </div>
  );
}

RecentSearches.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  sok: PropTypes.shape({
    hasSearched: PropTypes.bool.isRequired,
  }).isRequired,
}

export default RecentSearches;
