import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage = () => (
  /*
    action="/contact-success"
  */
  <Layout>
    <SEO title="Home" />
    <h1>Contact us</h1>
    <p>This form should theoretically submit data to Netlify</p>
    <form data-netlify="true" name="contact" id="contact" method="post">
      <input type="text" name="name" placeholder="Name" />
      <input type="text" name="email" placeholder="Email" />
      <input type="text" name="cell" placeholder="Cell" />
      <textarea name="message" placeholder="Message"></textarea>
      <br />
      <button type="submit">Send Message</button>
    </form>
  </Layout>
)

export default IndexPage
