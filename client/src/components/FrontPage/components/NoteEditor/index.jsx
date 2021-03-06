import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSelectedNote } from '../../selectors';
import { getRevisionSelectorVisibilityStatus } from '../Revisions/selectors';
import { StyledNoteEditor, TextareaWrapper, StyledLogo } from './styles';
import SVG from '../../../Shared/components/SVG';
import TagsEditor from '../TagsEditor';
import { editNote, saveNote } from './actions';

const _timeout = [];

export default function NoteEditor() {
  const _textarea = useRef(null);

  const dispatch = useDispatch();

  const note = useSelector(getSelectedNote);
  const isRevisionSelectorVisible = useSelector(
    getRevisionSelectorVisibilityStatus
  );

  function changeHandler(e) {
    dispatch(editNote(e.target.value, note._id));
  }

  function keyUpHandler() {
    const { _id: noteId, text } = note;

    if (_timeout[noteId]) {
      clearTimeout(_timeout[noteId]);
      _timeout[noteId] = null;
    }

    if (!_timeout[noteId]) {
      _timeout[noteId] = setTimeout(
        () => dispatch(saveNote(text, noteId)),
        750
      );
    }
  }

  return (
    <StyledNoteEditor revisionSelectorVisible={isRevisionSelectorVisible}>
      {!note ? (
        <StyledLogo>
          <SVG name='logo' size='140' color='gray' style={{ opacity: 0.2 }} />
        </StyledLogo>
      ) : (
        <>
          <TextareaWrapper>
            <textarea
              value={note.text}
              onChange={changeHandler}
              onKeyUp={keyUpHandler}
              ref={_textarea}
              spellCheck={false}
            />
          </TextareaWrapper>
          {!note.is_deleted && <TagsEditor />}
        </>
      )}
    </StyledNoteEditor>
  );
}
