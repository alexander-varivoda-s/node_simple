import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';

import FrontPageContainer from './components/FrontPageContainer';
import ContentContainer from './components/ContentContainer';
import RightColumn from './components/RightColumn';
import LeftColumn from './components/LeftColumn';
import {
  dataFetchStatus,
  getSelectedNote,
  getSelectedNoteId,
} from './selectors';
import { fetchDataAction, addNoteAction } from './actions';
import SearchBar from './containers/SearchBar';
import NotesList from './containers/NotesList';
import NoteEditor from './containers/NoteEditor';
import Toolbar from './containers/Toolbar';
import NoteInfo from './containers/NoteInfo';

class FrontPage extends PureComponent {
  static defaultProps = {
    isNoteSelected: false,
    selectedNote: null,
  };

  static propTypes = {
    fetchData: PropTypes.func.isRequired,
    addNote: PropTypes.func.isRequired,
    isNoteSelected: PropTypes.bool,
    selectedNote: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      created: PropTypes.string.isRequired,
      updated: PropTypes.string.isRequired,
      pinned: PropTypes.string,
      author: PropTypes.string.isRequired,
      is_deleted: PropTypes.bool.isRequired,
      tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
  };

  componentDidMount() {
    const { fetchData } = this.props;
    fetchData();
  }

  render() {
    const { addNote, isNoteSelected, selectedNote } = this.props;
    console.log(selectedNote, isNoteSelected);
    return (
      <FrontPageContainer>
        <Helmet>
          <title>Simplenote</title>
        </Helmet>
        <ContentContainer>
          <LeftColumn>
            <SearchBar addNote={addNote} />
            <NotesList />
          </LeftColumn>
          <RightColumn>
            <Toolbar />
            {isNoteSelected && <NoteEditor note={selectedNote} />}
          </RightColumn>
        </ContentContainer>
        {isNoteSelected && <NoteInfo note={selectedNote} />}
      </FrontPageContainer>
    );
  }
}

const mapStateToProps = state => ({
  dataIsFetched: dataFetchStatus(state),
  isNoteSelected: !!getSelectedNoteId(state),
  selectedNote: getSelectedNote(state),
});

const mapDispatchToProps = dispatch => ({
  fetchData: () => dispatch(fetchDataAction()),
  addNote: text => () => dispatch(addNoteAction(text)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FrontPage);
