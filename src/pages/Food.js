import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import fetchApiAction from '../redux/actions';
import fetchAPI from '../services/fetchApi';

class Food extends React.Component {
  constructor() {
    super();
    this.renderCards = this.renderCards.bind(this);
    this.renderCategories = this.renderCategories.bind(this);
    this.fetchCategories = this.fetchCategories.bind(this);
    this.onClickCategoryBtn = this.onClickCategoryBtn.bind(this);
    this.state = {
      categoriesList: [],
      apiEndPoint: 'search.php?s=',
    };
  }

  componentDidMount() {
    this.fetchFood();
    return this.fetchCategories();
  }

  onClickCategoryBtn({ target }) {
    const originalEndPoint = 'search.php?s=';
    const { apiEndPoint } = this.state;
    if (target.name === 'all') {
      return this.setState({
        apiEndPoint: originalEndPoint,
      }, () => this.fetchFood());
    }
    if (apiEndPoint !== `filter.php?c=${target.name}`) {
      return this.setState({
        apiEndPoint: `filter.php?c=${target.name}`,
      }, () => this.fetchFood());
    }
    return this.setState({
      apiEndPoint: originalEndPoint,
    }, () => this.fetchFood());
  }

  async fetchCategories() {
    const url = 'https://www.themealdb.com/api/json/v1/1/list.php?c=list';
    const responseAPI = await fetchAPI(url);
    const { meals } = responseAPI;
    this.setState({
      categoriesList: meals,
    });
  }

  async fetchFood() {
    const { SendApiToState } = this.props;
    const { apiEndPoint } = this.state;
    const url = `https://www.themealdb.com/api/json/v1/1/${apiEndPoint}`;
    const responseAPI = await fetchAPI(url);
    SendApiToState(responseAPI);
  }

  renderCategories() {
    const { categoriesList } = this.state;
    const maxCategories = 4;
    return categoriesList.map((category, index) => {
      if (index <= maxCategories) {
        return (
          <button
            name={ category.strCategory }
            key={ category.strCategory }
            type="button"
            data-testid={ `${category.strCategory}-category-filter` }
            onClick={ this.onClickCategoryBtn }
          >
            { category.strCategory }
          </button>
        );
      }
      return null;
    });
  }

  renderCards() {
    const { resultsApi: { meals } } = this.props;
    const maxNumberOfCards = 11;
    if (meals !== null) {
      return meals.map((food, index) => {
        if (index <= maxNumberOfCards) {
          return (
            <Link to={ `/comidas/${food.idMeal}` }>
              <div key={ index } data-testid={ `${index}-recipe-card` }>
                <h3 data-testid={ `${index}-card-name` }>{ food.strMeal }</h3>
                <img
                  src={ food.strMealThumb }
                  alt={ food.strMeal }
                  data-testid={ `${index}-card-img` }
                  width="150px"
                />
              </div>
            </Link>
          );
        }
        return null;
      });
    }
  }

  render() {
    return (
      <div>
        <Header title="Comidas" />
        <section>
          <button
            name="all"
            type="button"
            data-testid="All-category-filter"
            onClick={ this.onClickCategoryBtn }
          >
            All
          </button>
          { this.renderCategories() }
        </section>
        { this.renderCards() }
        <Footer />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  resultsApi: state.data.resultAPI,
});

const mapDispatchToProps = (dispatch) => ({
  SendApiToState: (payload) => dispatch(fetchApiAction(payload)),
});

Food.propTypes = {
  resultsApi: PropTypes.shape({
    meals: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  SendApiToState: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Food);
