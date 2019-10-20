import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"

const NotFoundPage = () => (
  <Layout>
    <SEO title="404: Not found" />
    <h1>Hmm...</h1>
    <p>The page you thought was here isn't here afterall.</p>
  </Layout>
)

export default NotFoundPage
