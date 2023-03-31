import { Header } from "components/Platform/Header";
import { ListCollections } from "components/Platform/ListCollections";
import { Menu } from "components/Platform/Menu";
import { Container } from "components/Platform/Platform.style";
import { Snackbar} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { useAtom } from "jotai";
import { AlertScheduleAtom } from "components/ScheduleButton/store";
import { ContainerContent } from "components/Platform/ListCollections/ListCollections.style";
import { FormOnBoarding } from "components/FormOnBoarding";
import { useState } from "react";

export function FormView(): JSX.Element {
  const [showMenu, setShowMenu] = useState(false);

  const handleShowMenu = () => {
    setShowMenu(true);
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  return (
    <Container>
      <Menu showMenu={showMenu} handleCloseMenu={handleCloseMenu} />
      <div className="flex flex-col flex-1 w-full">
        <Header
          isPlatformPage={false}
          handleShowMenu={handleShowMenu}
          showMenu={showMenu}
        />
        <ContainerContent className="justify-center items-center w-full">
          <FormOnBoarding />
        </ContainerContent>
      </div>
    </Container>
  );
}