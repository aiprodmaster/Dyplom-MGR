//using System;
//using Hydra;
//using System.Windows.Forms;
//using System.Drawing;

//[assembly: CallbackAssemblyDescription("Blokada menu kontekstowego", "Przyk³adowy callback KntEdycja", "ComArch S.A.", "1.0", "8.0", "07-05-2009")]
//namespace Inne
//{
//    [SubscribeProcedure((Procedures)Procedures.KntListaGrup, "KntEdycja")]

//    public class KntClbk : Callback
//    {
//        ClaWindow Parent, przycisk, kontrolka;
//        public override void Init()
//        {

//            AddSubscription(false, 0, Events.OpenWindow, new TakeEventDelegate(OnOpenWindow));
//            AddSubscription(false, 0, Events.ResizeWindow, new TakeEventDelegate(OnResizeWindow));

//        }

//        bool OnOpenWindow(Procedures ProcId, int ControlId, Events Event)
//        {
//            Parent = GetWindow();
//            kontrolka = Parent.AllChildren["?ListaKontrahentow"];

//            przycisk = Parent.AllChildren.Add(ControlTypes.button);
//            przycisk.Visible = true;
//            przycisk.Bounds = new Rectangle(Parent.Bounds.Width - 180, Parent.Bounds.Height - 20, 20, 10);
//            przycisk.OnAfterAccepted += new TakeEventDelegate(next);
//            przycisk.TextRaw = ">";

//            AddSubscription(true, kontrolka.Id, Events.AlertKey, new TakeEventDelegate(prawyprzycisk));
//            return true;
//        }
//        bool next(Procedures ProcId, int ControlId, Events Event)
//        {
//            Runtime.WindowController.SelectControl(kontrolka.Id);
//            Runtime.WindowController.PostEvent(kontrolka.Id, Events.ScrollDown);
//            return true;
//        }

//        bool prawyprzycisk(Procedures ProcId, int ControlId, Events Event)
//        {

//            int kodASCII = Runtime.WindowController.GetKeyCode();
//            if (kodASCII == 2)
//            {
//                Runtime.WindowController.UnlockThread();
//                MessageBox.Show("menu zablokowane");
//                Runtime.WindowController.LockThread();

//                return false;
//            }

//            else
//                return true;
//        }
//        private bool OnResizeWindow(Procedures ProcID, int ControlID, Events Event)
//        {
//            Parent = GetWindow();
//            przycisk.Bounds = new Rectangle(Parent.Bounds.Width - 180, Parent.Bounds.Height - 20, 20, 10);

//            return true;
//        }


//        public override void Cleanup()
//        {
//        }

//    }

//}
