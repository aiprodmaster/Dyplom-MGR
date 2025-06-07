using System;
using Hydra;
using System.Windows.Forms;
using System.Drawing;
using System.ComponentModel;
using System.Data.SqlClient;


[assembly: CallbackAssemblyDescription("atrybuty",
"atrybuty",
"Comarch",
"1.0",
"8.0",
"21-07-2008")]


namespace atrybuty
{

    [SubscribeProcedure((Procedures)Procedures.TrN_FS, "atrybuty")]
    public class callbacktestowy : Callback
    {
        ClaWindow button, parent, zakladka;
        long gidtyp, gidnumer;
        public override void Init()
        {
            AddSubscription(false, 0, Events.OpenWindow, new TakeEventDelegate(openwindow));

        }
        public bool openwindow(Procedures ProcId, int ControlId, Events Event)
        {
            gidtyp = TraNag.TrN_GIDTyp;
            gidnumer=TraNag.TrN_GIDNumer;

            Rectangle WndBnd = GetWindow().Bounds;
            parent = GetWindow();
            zakladka = parent.AllChildren["?TabAtrybuty"];
            button = zakladka.AllChildren.Add(ControlTypes.button);
            button.Visible = true;
            button.TextRaw = "odczytaj";
            button.Bounds = new Rectangle(WndBnd.Width - 200, WndBnd.Height - 25, 30, 12);
            AddSubscription(false, button.Id, Events.Accepted, new TakeEventDelegate(lista));
            parent.OnBeforeSized += new TakeEventDelegate(ZmianaOkna);
            return true;
        }
        public bool lista(Procedures ProcId, int ControlId, Events Event)
        {

            ClaWindow atrybuty = zakladka.Children["?lAtrybuty"];
            SqlCommand SelectCommand = new SqlCommand("with ListaAtrybutow as (select atr_wartosc, row_number() over (order by atr_id) as NumerWiersza  from cdn.atrybuty where atr_obityp=" + gidtyp + " and atr_obinumer=" + gidnumer + ") select  atr_wartosc from ListaAtrybutow where NumerWiersza=" + atrybuty.SelectedRaw);
            SelectCommand.Connection = Runtime.ActiveRuntime.Repository.Connection;
            SelectCommand.Connection.Open();
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("Numer wiersza: " +atrybuty.SelectedRaw +" | wartoœæ wybrana: "+ SelectCommand.ExecuteScalar().ToString());
            Runtime.WindowController.LockThread();
            SelectCommand.Connection.Close();
            return true;
        }
        private bool ZmianaOkna(Procedures ProcedureId, int ControlId, Events Event)
        {
            Rectangle WndBnd = GetWindow().Bounds;
            button.Bounds = new Rectangle(WndBnd.Width - 200, WndBnd.Height - 25, 30, 12); 
           
            return true;
        }


        public override void Cleanup()
        {
        }
    }
}
