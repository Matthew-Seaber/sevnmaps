import { InfoPaneState } from "./InfoPaneContext";

import ListsPane from "./panes/ListsPane";
import SingularListPane from "./panes/SingularListPane";
import PlacePane from "./panes/PlacePane";
import FavoritesPane from "./panes/FavoritesPane";
import VisitedPane from "./panes/VisitedPane";

interface InfoPaneContentProps {
  infoPaneState: InfoPaneState;
}

function InfoPaneContent({ infoPaneState }: InfoPaneContentProps) {
  switch (infoPaneState.type) {
    case "lists":
      return <ListsPane />;

    case "singular_list":
      return (
        <SingularListPane
          listID={infoPaneState.listID}
        />
      );

    case "place":
      return <PlacePane placeID={infoPaneState.placeID} />;

    case "favorites":
      return <FavoritesPane />;

    case "visited":
      return <VisitedPane />;

    case "closed":
      return null;

    default:
      return null;
  }
}

export default InfoPaneContent;
