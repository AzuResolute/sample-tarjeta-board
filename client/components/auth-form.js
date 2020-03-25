import React from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {auth} from '../store'

/**
 * COMPONENT
 */
const AuthForm = props => {
  const {name, displayName, handleSubmit, error} = props

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center background h-75"
      style={{backgroundColor: '#c0ffee'}}
    >
      <h3>Please log in to access the tarjeta board</h3>
      <form onSubmit={handleSubmit} name={name} className="log-in-container">
        <div className="forms row form-group form-check form-check-inline">
          <label htmlFor="email" className="col-4 font-weight-bold">
            Email
          </label>
          <input name="email" type="text" className="col-8 form-control" />
        </div>
        <div className="forms row form-group form-check form-check-inline">
          <label htmlFor="password" className="col-4 font-weight-bold">
            Password
          </label>
          <input
            name="password"
            type="password"
            className="col-8 form-control"
          />
        </div>
        <div>
          <button type="submit" className="btn btn-info">
            {displayName}
          </button>
        </div>
        {error && error.response && <div> {error.response.data} </div>}
      </form>
    </div>
  )
}

/**
 * CONTAINER
 *   Note that we have two different sets of 'mapStateToProps' functions -
 *   one for Login, and one for Signup. However, they share the same 'mapDispatchToProps'
 *   function, and share the same Component. This is a good example of how we
 *   can stay DRY with interfaces that are very similar to each other!
 */
const mapLogin = state => {
  return {
    name: 'login',
    displayName: 'Login',
    error: state.user.error
  }
}

const mapSignup = state => {
  return {
    name: 'signup',
    displayName: 'Sign Up',
    error: state.user.error
  }
}

const mapDispatch = dispatch => {
  return {
    handleSubmit(evt) {
      evt.preventDefault()
      const formName = evt.target.name
      const email = evt.target.email.value
      const password = evt.target.password.value
      dispatch(auth(email, password, formName))
    }
  }
}

export const Login = connect(mapLogin, mapDispatch)(AuthForm)
export const Signup = connect(mapSignup, mapDispatch)(AuthForm)

/**
 * PROP TYPES
 */
AuthForm.propTypes = {
  name: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  error: PropTypes.object
}
