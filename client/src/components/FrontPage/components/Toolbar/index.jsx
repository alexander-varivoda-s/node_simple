import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  getNoteInfoVisibilityStatus,
  getSelectedNote,
  getSidebarVisibilityStatus,
} from '../../selectors';

import SVG from '../../../Shared/components/SVG';
import {
  IconButton,
  PrimaryButton,
  DangerButton,
} from '../../../Shared/components/Button';
import { getRevisionSelectorVisibilityStatus } from '../Revisions/selectors';
import AccountDropdown from '../../../AccountDropdown';
import { getUser } from '../../../User/selectors';

import { StyledToolbar, ToolsList } from './styles';
import { toggleNoteInfo } from '../NoteInfo/actions';
import { deleteNote, moveNoteToTrash, toggleSidebar } from './actions';
import { restoreNote, toggleRevisionSelector } from '../Revisions/actions';

export default function Toolbar() {
  const user = useSelector(getUser);
  const selectedNote = useSelector(getSelectedNote);
  const isNoteInfoVisible = useSelector(getNoteInfoVisibilityStatus);
  const isSidebarVisible = useSelector(getSidebarVisibilityStatus);
  const isRevisionSelectorVisible = useSelector(
    getRevisionSelectorVisibilityStatus
  );

  const dispatch = useDispatch();

  function noteInfoToggle() {
    dispatch(toggleNoteInfo(!isNoteInfoVisible));
  }

  function sidebarToggle() {
    dispatch(toggleSidebar(!isSidebarVisible));
  }

  function revisionSelectorToggle() {
    dispatch(toggleRevisionSelector(!isRevisionSelectorVisible));
  }

  function moveToTrash() {
    dispatch(moveNoteToTrash());
  }

  function noteRestoreHandler() {
    dispatch(restoreNote());
  }

  function noteDeleteHandler() {
    dispatch(deleteNote());
  }

  return (
    <StyledToolbar>
      {selectedNote && !selectedNote.is_deleted && (
        <>
          <ToolsList>
            <li>
              <IconButton onClick={sidebarToggle}>
                <SVG name='sidebar' size='22' />
              </IconButton>
            </li>
          </ToolsList>
          <ToolsList>
            <li>
              <IconButton onClick={revisionSelectorToggle}>
                <SVG name='revisions' size='22' />
              </IconButton>
            </li>
            <li>
              <IconButton onClick={moveToTrash}>
                <SVG name='trash' size='22' />
              </IconButton>
            </li>
            <li>
              <IconButton onClick={noteInfoToggle}>
                <SVG name='info' size='22' />
              </IconButton>
            </li>
          </ToolsList>
        </>
      )}
      {selectedNote && selectedNote.is_deleted && (
        <ToolsList>
          <li>
            <DangerButton compact onClick={noteDeleteHandler}>
              Delete Forever
            </DangerButton>
          </li>
          <li>
            <PrimaryButton compact onClick={noteRestoreHandler}>
              Restore Note
            </PrimaryButton>
          </li>
        </ToolsList>
      )}
      <AccountDropdown
        email={user.email}
        items={[
          <Link to='/settings'>Settings</Link>,
          <Link to='/logout'>Sign Out</Link>,
        ]}
      />
    </StyledToolbar>
  );
}
