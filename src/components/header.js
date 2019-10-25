import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"

const Header = ({ siteTitle }) => (
  <header>
    <div className="container-fluid pt-3 pb-1 bg-success title">
      <h2>
          {siteTitle}
      </h2>
    </div>
  </header>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: `DJ Playlist Preview`
}

export default Header
