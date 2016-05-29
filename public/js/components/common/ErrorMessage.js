import React from 'react';
const PropTypes = React.PropTypes;
import cx from 'classnames';

// <ErrorMessage errorMessage={rute.errorMessage} canReload={true} disabled={!hasError} />
const ErrorMessage = ({disabled, errorMessage, canReload, className}) => {
  if(disabled) {
    return null;
  }

  let classes = cx(Object.assign({}, className, {
    'alert': true,
  }));

  let reload = !canReload || (
      <span><button onClick={(ev) => { ev.preventDefault(); window.location.reload(); } }>Klikk her for å prøve igjen</button></span>
    );

  return (
    <div className={classes}>
      <section style={{marginBottom: '1rem'}}><span>{errorMessage}</span></section>
      <section>{reload}</section>
    </div>
  );
};

ErrorMessage.propTypes = {
  errorMessage: PropTypes.string.isRequired,
  canReload: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  className: PropTypes.object,
};

export default ErrorMessage;