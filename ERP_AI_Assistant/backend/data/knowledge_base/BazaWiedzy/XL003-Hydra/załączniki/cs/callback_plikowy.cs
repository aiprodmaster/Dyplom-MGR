using System;
using Hydra;
using System.Windows.Forms;
using System.Drawing;

[assembly: CallbackAssemblyDescription("KntEdycja", "Przyk豉dowy callback KntEdycja", "ComArch S.A.", "1.0", "7.0", "10-08-2007")]
namespace KntClbk
{
    [SubscribeProcedure((Procedures)Procedures.KntEdycja, "KntEdycja")]

    public class KntClbk : Callback
    {
        public override void Init()
        {

            AddFileActionSubscription(true, FileActionTypes.InitModifier, new FileActionDelegate(InitModifier));
            AddFileActionSubscription(true, FileActionTypes.InsertCancel, new FileActionDelegate(InsertCancel));
            AddFileActionSubscription(true, FileActionTypes.InsertInit, new FileActionDelegate(InsertInit));
            AddFileActionSubscription(true, FileActionTypes.InsertAction, new FileActionDelegate(InsertAction));
            AddFileActionSubscription(true, FileActionTypes.UpdateCancel, new FileActionDelegate(UpdateCancel));
            AddFileActionSubscription(true, FileActionTypes.UpdateInit, new FileActionDelegate(UpdateInit));
            AddFileActionSubscription(true, FileActionTypes.UpdateAction, new FileActionDelegate(UpdateAction));
            AddFileActionSubscription(true, FileActionTypes.DeleteCancel, new FileActionDelegate(DeleteCancel));
            AddFileActionSubscription(true, FileActionTypes.DeleteInit, new FileActionDelegate(DeleteInit));
            AddFileActionSubscription(true, FileActionTypes.DeleteAction, new FileActionDelegate(DeleteAction));
            AddFileActionSubscription(true, FileActionTypes.CancelModifier, new FileActionDelegate(CancelModifier));
            AddSubscription(true, 0, Events.OpenWindow, new TakeEventDelegate(OnOpenWindow));
        }
        public bool InsertCancel(Procedures ProcedureId, GID GID, ADODB._Recordset Attr)
        {
            //funkcja wywo造wana przy dodawaniu nowego dokumentu FZ
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("InsertCancel");
            Runtime.WindowController.LockThread();
            return true;


        }
        public bool InsertInit(Procedures ProcedureId, GID GID, ADODB._Recordset Attr)
        {
            //funkcja wywo造wana przy dodawaniu nowego dokumentu FZ
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("InsertInit");
            Runtime.WindowController.LockThread();
            return true;
        }
        public bool InsertAction(Procedures ProcedureId, GID GID, ADODB._Recordset Attr)
        {
            //funkcja wywo造wana przy dodawaniu nowego dokumentu FZ
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("InsertAction");
            Runtime.WindowController.LockThread();
            return true;
        }
        public bool UpdateCancel(Procedures ProcedureId, GID GID, ADODB._Recordset Attr)
        {
            //funkcja wywo造wana przy dodawaniu nowego dokumentu FZ
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("UpdateCancel");
            Runtime.WindowController.LockThread();
            return true;
        }
        public bool UpdateInit(Procedures ProcedureId, GID GID, ADODB._Recordset Attr)
        {
            //funkcja wywo造wana przy dodawaniu nowego dokumentu FZ
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("updateInit");
            Runtime.WindowController.LockThread();
            return true;
        }
        public bool UpdateAction(Procedures ProcedureId, GID GID, ADODB._Recordset Attr)
        {
            //funkcja wywo造wana przy dodawaniu nowego dokumentu FZ
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("updateAction");
            Runtime.WindowController.LockThread();
            return true;
        }
        public bool DeleteCancel(Procedures ProcedureId, GID GID, ADODB._Recordset Attr)
        {
            //funkcja wywo造wana przy dodawaniu nowego dokumentu FZ
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("DeleteCancel");
            Runtime.WindowController.LockThread();
            return true;
        }
        public bool DeleteInit(Procedures ProcedureId, GID GID, ADODB._Recordset Attr)
        {
            //funkcja wywo造wana przy dodawaniu nowego dokumentu FZ
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("DeleteInit");
            Runtime.WindowController.LockThread();
            return true;
        }
        public bool DeleteAction(Procedures ProcedureId, GID GID, ADODB._Recordset Attr)
        {
            //funkcja wywo造wana przy dodawaniu nowego dokumentu FZ
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("DeleteAction");
            Runtime.WindowController.LockThread();
            return true;
        }
        public bool CancelModifier(Procedures ProcedureId, GID GID, ADODB._Recordset Attr)
        {
            //funkcja wywo造wana przy dodawaniu nowego dokumentu FZ
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("CancelModifier");
            Runtime.WindowController.LockThread();
            return true;
        }

        public bool InitModifier(Procedures ProcedureId, GID GID, ADODB._Recordset Attr)
        {
            //funkcja wywo造wana przy edycji dokumentu FZ
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("InitModifier");
            Runtime.WindowController.LockThread();
            return true;
        }

        bool OnOpenWindow(Procedures ProcId, int ControlId, Events Event)
        {
            ClaWindow Parent = GetWindow();
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("Formatka");
            Runtime.WindowController.LockThread();
            return true;
        }

        public override void Cleanup()
        {
        }
    }

}
