using System;
using System.IO;
using System.Drawing;
using System.Text;
using System.Windows.Forms;
using Hydra;

[assembly: CallbackAssemblyDescription("UkrycieKolumny", "UkrycieKolumny", "Comarch", "1.0", "8.0", "29-07-2008")]

namespace UkrycieKolumny
{

    [SubscribeProcedure(Procedures._TwrListaGrup, "UkrycieKolumny")]

    public class UkrycieKolumny : Callback
    {

        private ClaWindow thisWnd;
        public UkrycieKolumny() { }

        public override void Init()
        {
            AddSubscription(false, 0, Events.OpenWindow, new TakeEventDelegate(OnOpenWindow));
            AddSubscription(true, 0, Events.ResizeWindow, new TakeEventDelegate(OnTabChange));
        }

        public override void Cleanup() { }

        private bool OnOpenWindow(Procedures ProcID, int ControlID, Events Event)
        {

            ClaWindow Parent = GetWindow();
            thisWnd = Parent;
            AddSubscription(false, Parent.Children["?CurrentTab"].Id, Events.NewSelection, new TakeEventDelegate(OnTabChange));

            //kod pomocniczy wrzuca FormatRaw do schowka Windows
            //string test2;
            //test2 = Parent.AllChildren["?BrowseQueueZnajdz"].FormatRaw;
            //Clipboard.SetDataObject(test2);

            Parent.AllChildren["?List"].FormatRaw = "10LJ@s1@[0L(2)|M*@s40@#3#]|M~Symbol~L[91L(2)*@s40@#8#]|M~Kod~L(2)[309L(2)|*@s255@#13#]|M~Nazwa~L(2)[57R(2)M*@s16@#18#18L(2)|*@s3@#23#](-2)|M~Cena netto~[32R(2)|*@s8@#28#](37)|M~J.m.~[60RM*@s12@#33#22L|*@s5@#38#]|M~Sprzeda¿~[55RM*@s12@#43#22L|*@s5@#48#]|M~Magazyn~[44RM*@s12@#53#22L|*@s5@#58#]|M~Rezerwacje~0R(2)|M*~Ksiêgowa~@n-15.2@#63#";
            Parent.AllChildren["?Browse:1"].FormatRaw = "10LJ@s1@[49L(2)|*I@s40@#3#]|M~Kod~L(2)[309L(2)|*@s255@#9#]|M~Nazwa~L(2)[60R(2)M*@s16@#14#18L(2)|*@s3@#19#](-2)|M~Cena netto~[32R(2)|*@s8@#24#](37)|M~J.m.~[37RM*@s12@#29#20L|*@s5@#34#]|M~Sprzeda¿~[32RM*@s12@#39#20L|*@s5@#44#]|M~Magazyn~[37RM*@s12@#49#20L|*@s5@#54#]|M~Rezerwacje~0R(2)|M*~Ksiêgowa~@n-15.2@#59#";
            Parent.AllChildren["?BrowseQueueZnajdz"].FormatRaw = "10LI@s10@56L(2)|M*~Kod~@s40@#3#56L(2)|M*~Nazwa~@s255@#8#[60R(2)M*@s16@#13#18L(2)|*@s3@#18#](-2)|M~Cena netto~24R(2)|M*~J.m.~@s8@#23#[32RM*@s12@#28#20L|*@s5@#33#](60)|M~Sprzeda¿~[31RM*@s12@#38#20L|*@s5@#43#](60)|M~Magazyn~[32RM*@s12@#48#20L|*@s5@#53#](313)|M~Rezerwacje~0R(2)|M*~Ksiêgowa~@n-15.2@#58#";
            return (true);

        }



        private bool OnTabChange(Procedures ProcID, int ControlID, Events Event)
        {
            ClaWindow Parent = GetWindow();
            Parent.AllChildren["?List"].FormatRaw = "10LJ@s1@[0L(2)|M*@s40@#3#]|M~Symbol~L[91L(2)*@s40@#8#]|M~Kod~L(2)[309L(2)|*@s255@#13#]|M~Nazwa~L(2)[57R(2)M*@s16@#18#18L(2)|*@s3@#23#](-2)|M~Cena netto~[32R(2)|*@s8@#28#](37)|M~J.m.~[60RM*@s12@#33#22L|*@s5@#38#]|M~Sprzeda¿~[55RM*@s12@#43#22L|*@s5@#48#]|M~Magazyn~[44RM*@s12@#53#22L|*@s5@#58#]|M~Rezerwacje~0R(2)|M*~Ksiêgowa~@n-15.2@#63#";
            Parent.AllChildren["?Browse:1"].FormatRaw = "10LJ@s1@[49L(2)|*I@s40@#3#]|M~Kod~L(2)[309L(2)|*@s255@#9#]|M~Nazwa~L(2)[60R(2)M*@s16@#14#18L(2)|*@s3@#19#](-2)|M~Cena netto~[32R(2)|*@s8@#24#](37)|M~J.m.~[37RM*@s12@#29#20L|*@s5@#34#]|M~Sprzeda¿~[32RM*@s12@#39#20L|*@s5@#44#]|M~Magazyn~[37RM*@s12@#49#20L|*@s5@#54#]|M~Rezerwacje~0R(2)|M*~Ksiêgowa~@n-15.2@#59#";
            Parent.AllChildren["?BrowseQueueZnajdz"].FormatRaw = "10LI@s10@56L(2)|M*~Kod~@s40@#3#56L(2)|M*~Nazwa~@s255@#8#[60R(2)M*@s16@#13#18L(2)|*@s3@#18#](-2)|M~Cena netto~24R(2)|M*~J.m.~@s8@#23#[32RM*@s12@#28#20L|*@s5@#33#](60)|M~Sprzeda¿~[31RM*@s12@#38#20L|*@s5@#43#](60)|M~Magazyn~[32RM*@s12@#48#20L|*@s5@#53#](313)|M~Rezerwacje~0R(2)|M*~Ksiêgowa~@n-15.2@#58#";
            return (true);

        }

    }

}
