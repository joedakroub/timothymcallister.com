import { Caption, Heading, Paragraph, Subtitle } from '../components/typography'
import { Container, Page, Section, Wrapper } from '../components/layout'

import Helmet from 'react-helmet'
import Hero from '../components/hero'
import LazyLoad from 'react-lazyload'
import React from 'react'
import styles from '../styles/performances.module.scss'

export default class Performances extends React.Component {

  constructor(props) {
    super(props)
    this.onChange = this.onChange.bind(this)
    this.state = {
      currentYear: new Date().getUTCFullYear()
    }
  }

  getEventURL(locationName, location) {
    locationName = encodeURIComponent(locationName)
    return `http://www.google.com/maps/place/${locationName}/@${location.lat},${location.lon},13z`
  }

  getFormattedDate(date) {
    return new Intl.DateTimeFormat('en-us', {
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(date))
  }

  getFormattedMonth(month) {
    return new Date(`${month+1}/1/17`).toLocaleString('en-us', { month: 'long' })
  }

  onChange(e) {
    this.setState({
      currentYear: e.target.value
    })

    this.wrapper.scrollIntoView()
  }

  render() {
    const pageData = this.props.data.allContentfulPage.edges[0].node
    const performances = {}

    const performancesForCurrentYear = this.props.data.allContentfulPerformance.edges
      .filter(({ node }) => new Date(node.date).getUTCFullYear() == this.state.currentYear)

    const months = performancesForCurrentYear
      .map(({ node }) => new Date(node.date).getUTCMonth())
      .filter((value, index, self) => self.indexOf(value) === index)

    const years = this.props.data.allContentfulPerformance.edges
      .map(({ node }) => new Date(node.date).getUTCFullYear())
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort()
      .reverse()

    months.map(month => {
      performances[month] = performancesForCurrentYear
        .filter(({ node }) => new Date(node.date).getUTCMonth() === month)
    })

    return (
      <Page>
        <Helmet>
          <title>{pageData.title}</title>
        </Helmet>

        <Hero image={pageData.image.responsiveSizes} title={pageData.title} />

        <Wrapper ref={wrapper => this.wrapper = wrapper}>
          <select
            className={styles.yearSelector}
            defaultValue={this.state.currentYear}
            name="yearSelector"
            onChange={(e) => this.onChange(e)}>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
          </select>

          {months.map((month, index) => {
            const theme = index % 2 === 0 ? `light` : `dark`

            return (
          <Section key={index} padding theme={theme}>
            <Subtitle content={this.getFormattedMonth(month)} />

            {performances[month].map(({ node }, index) => {
              const url = this.getEventURL(node.locationName, node.location)
              const futureDate = new Date(node.date) >= new Date()

              return (
              <article className={styles.performance}>
                <Container className={styles.performanceWrapper} width="wide">
                  <div className={styles.performanceDetails}>
                    <Heading className={styles.text} content={node.title} />
                    <Caption content={this.getFormattedDate(node.date)} />
                    <Paragraph content={node.description.description} />
                  </div>

                  <div className={styles.map}>
                    <LazyLoad height='100vh' key={node.id} offset={500} once>
                      <a className={styles.mapWrapper} href={url}>
                        <div className={styles.mapImage} style={{ backgroundImage: `url('/static/${node.fields.mapImage}')` }}></div>
                      </a>
                    </LazyLoad>
                  </div>

                  <footer className={styles.detailFooter}>
                    <a className={styles.link} href={url}>{node.locationName}</a>
                    {node.ticketInformation && futureDate
                      ? <a className={styles.link} href={node.ticketInformation}>Ticket Information</a>
                      : ''
                    }
                  </footer>
                </Container>
              </article>
              )
            })}

          </Section>
          )
          })}
        </Wrapper>
      </Page>
    )
  }
}

export const query = graphql`
  query PerformancesQuery {
    allContentfulPerformance(
      sort: {
        fields: [date, title],
        order: ASC
    }) {
      edges {
        node {
          id
          title
          date
          fields {
            mapImage
          }
          location {
            lon
            lat
          }
          locationName
          ticketInformation
          description {
            id
            description
          }
        }
      }
    },

    allContentfulPage(
      filter: {
        slug: {
          eq: "/performances"
        }
      }
    ) {
      edges {
        node {
          id
          title
          image {
            responsiveSizes(maxWidth: 2048, quality: 75) {
              aspectRatio
              base64
              src
              srcSet
              sizes
            }
          }
        }
      }
    }
  }
`
