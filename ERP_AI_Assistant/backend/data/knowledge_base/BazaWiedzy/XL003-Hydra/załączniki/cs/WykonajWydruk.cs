//using System;
//using System.Drawing;
//using System.Text;
//using System.Windows.Forms;
//using Hydra;
//
//[assembly: CallbackAssemblyDescription("WykonajWydruk", "Przykład prostego Callbacka", "Comarch S.A.", "1.0", "10.5", "29-03-2012")]
//namespace ProstyCallback
//{
//    [SubscribeProcedure(Procedures.TrN_FS, "Wydruk FS")]
//
//    public class TestClass : Callback
//    {
//        ClaWindow parent, ecod, button;
//
//
//        public override void Init()
//        {
//            AddSubscription(true, 0, Events.JustAfterWindowOpening, new TakeEventDelegate(Just));
//            AddSubscription(false, 0, Events.OpenWindow, new TakeEventDelegate(OnOpenWindow));
//        }
//
//        public override void Cleanup() { }
//
//        private bool Just(Procedures ProcID, int ControlID, Events Event)
//        {
//            parent = GetWindow();
//            ecod = parent.AllChildren["?ECODEksport:Button"];
//
//            return (true);
//        }
//        private bool OnOpenWindow(Procedures ProcID, int ControlID, Events Event)
//        {
//            
//            button = parent.AllChildren.Add(ControlTypes.button);
//            button.Visible = true;
//            button.Bounds = new Rectangle(ecod.Bounds.X, ecod.Bounds.Y + 150, ecod.Bounds.Width, ecod.Bounds.Height);
//            button.TextRaw = "WDR";
//            AddSubscription(false, button.Id, Events.Accepted, new TakeEventDelegate(wydruk));
//
//            return (true);
//        }
//
//        private bool wydruk(Procedures ProcID, int ControlID, Events Event)
//        {
//   
//            Runtime.ConfigurationDictionary.WykonajWydruk((int)ProcID, 1, 0, 303, 6, "", "(TrN_GIDTyp=" + TraNag.TrN_GIDTyp.ToString() + " AND   TrN_GIDNumer=" + TraNag.TrN_GIDNumer.ToString() + ")", "(TrN_GIDTyp=" + TraNag.TrN_GIDTyp.ToString() + " AND TrN_GIDNumer=" + TraNag.TrN_GIDNumer.ToString() + ")", "", 3);
//             
//            return true;
//        }
//    }
//}
