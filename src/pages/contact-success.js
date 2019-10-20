import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage = () => (
  <Layout>
    <SEO title="Contact Form Success" />
    <h1>Thank you!</h1>
    <p>We will contact you as soon as we can.</p>
    <button onClick={() => { window.location.href="/"}}>Back to home</button>
    <div>&nbsp;</div>
  </Layout>
)

export default IndexPage
