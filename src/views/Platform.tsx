import { Header } from "components/Platform/Header";
import { ListCollections } from "components/Platform/ListCollections";
import { Menu } from "components/Platform/Menu";
import { Container } from "components/Platform/Platform.style";
import { Snackbar} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { useAtom } from "jotai";
import { AlertScheduleAtom } from "components/ScheduleButton/store";
import { useState } from "react";


export function Platform():JSX.Element{

  const [alertStateSchedule, setAlertStateSchedule ] = useAtom(AlertScheduleAtom)
  const [showMenu, setShowMenu] = useState(false);

  const handleShowMenu = () => {
    setShowMenu(true);
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };
    
    return (<Container>
      <Menu showMenu={showMenu} handleCloseMenu={handleCloseMenu} />
      <div className="flex flex-col flex-1 w-full">
        <Header
          isPlatformPage
          handleShowMenu={handleShowMenu}
          showMenu={showMenu}
        />
        <ListCollections />
      </div>
      <Snackbar
        open={alertStateSchedule.open}
        autoHideDuration={6000}
        onClose={() => setAlertStateSchedule({ ...alertStateSchedule, open: false })}
      >
        <Alert
          onClose={() => setAlertStateSchedule({ ...alertStateSchedule, open: false })}
          severity={alertStateSchedule.severity}
        >
          {alertStateSchedule.message}
        </Alert>
      </Snackbar>
    </Container>
    )
}