// Phase 2 fixture bodies for the 6 seed posts. Phase 3 replaces this
// module with MDX rendering — pages keep importing the same `getPostBody`
// helper, so the swap is invisible upstream.

import { ImageSlot } from "@/components/ImageSlot";
import type { ReactNode } from "react";

const Section = ({ num, title, children }: { num: string; title: string; children: ReactNode }) => (
  <>
    <h2 id={slugify(title)}>
      <span className="num">{num}</span>
      {title}
    </h2>
    {children}
  </>
);

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const Figure = ({ alt, caption }: { alt: string; caption: string }) => (
  <figure>
    <div className="ph">
      <ImageSlot placeholder={alt} style={{ position: "absolute", inset: 0 }} />
    </div>
    <figcaption>{caption}</figcaption>
  </figure>
);

// ---------------------------------------------------------------------------

const CasaAgosto = () => (
  <>
    <p>
      Había una ventana que daba al verano y otra que daba al miedo. Yo elegí la que tenía cortinas
      blancas, y aún así, soñé con la otra durante meses. La casa era de mi abuela materna, una casa
      que olía a pan de ayer y a hierbas que ella nunca decía cómo se llamaban — solo cómo se
      usaban.
    </p>
    <p>
      Cuando llegábamos en agosto, la luz se metía por todos lados como si supiera el camino de
      memoria. La cocina tenía baldosas que se enfriaban a las cuatro de la tarde. Yo me sentaba ahí
      con los pies descalzos, fingiendo que leía, escuchando a las mujeres hablar bajito de cosas
      que entonces no entendía y ahora reconozco en mi propia voz.
    </p>

    <Section num="01" title="La ventana que daba al verano">
      <p>
        Mi abuela decía que las ventanas tienen memoria. Que cada una recuerda lo que vio primero —
        y que si las abres siempre a la misma hora, te devuelven ese primer recuerdo intacto, como
        un favor antiguo. La que daba al patio recordaba un agosto sin nombre, con las cigarras tan
        altas que tapaban la radio. La otra, la del fondo, recordaba algo de lo que nunca
        hablábamos.
      </p>
      <blockquote>
        «Las casas no se heredan, se aprenden. Una casa se aprende como un idioma — primero las
        palabras grandes, después las pequeñas, y al final lo que se dice sin decir.»
        <cite>— Anotación, cuaderno verde, agosto 2024</cite>
      </blockquote>
    </Section>

    <Section num="02" title="Recados en la harina">
      <p>
        Ella escribía con el dedo sobre la harina cuando algo se le olvidaba. «Hervir leche»,
        «llamar Carmen», «no abrir el armario azul». Yo creía entonces que era un juego — más tarde
        entendí que era un mapa. La harina se barría al final del día, y los recados se iban con
        ella. Pero algunos quedaban en mi memoria, como sombras de letras.
      </p>
      <Figure
        alt="Imagen interior — mesa, harina, manos"
        caption="La mesa de mármol blanco. Tres rayas de harina. Un dedo cualquiera."
      />
    </Section>

    <Section num="03" title="El piano que nadie tocaba">
      <p>
        En el salón había un piano que nadie tocaba pero que se afinaba todos los años. «Por si
        acaso», decía mi tía. Una vez le pregunté por si acaso qué, y se rio sin contestarme.
        Aprendí pronto que en esa casa había preguntas que se hacían con los ojos, no con la boca, y
        que la respuesta llegaba — si llegaba — años después, en otra cocina, con otra luz.
      </p>
    </Section>

    <Section num="04" title="Lo que aprendió a vivir en los pasillos">
      <p>
        Lo que aprendió a vivir en los pasillos no era miedo, exactamente. Era una forma de espera.
        Como si la casa estuviera siempre a punto de decir algo. Cuando volví a entrar, veinte años
        después, las ventanas seguían ahí — la del verano, la del miedo. Las dos abiertas. Y, por
        primera vez, no me asustó la del fondo. Me asustó pensar que ya no se acordaba de mí.
      </p>
    </Section>
  </>
);

const VeranoOtraCasa = () => (
  <>
    <p>
      Volver no es siempre volver. A veces es entrar a una habitación que se vació de ti hace
      tiempo, y reconocerla por un olor que no es exactamente el de antes pero que, sin embargo,
      sabe tu nombre. La otra casa estaba en la misma calle, dos puertas más allá, y solo nos
      asomábamos cuando alguien moría. Este verano fui sin que muriera nadie.
    </p>
    <p>
      La higuera del patio había crecido lo suficiente para tapar la ventana del cuarto donde
      aprendimos a leer. Eso, supongo, es lo que llaman pasar el tiempo: que un árbol haga lo que
      tenía que hacer.
    </p>
    <Section num="01" title="El olor del verano nuevo">
      <p>
        Olía a cal y a higos por madurar. La cal la habían echado los nuevos dueños — gente
        cuidadosa, me dijeron, que limpiaba la casa como si la fueran a heredar dos veces. Los higos
        eran los mismos. Esos no se pueden cambiar.
      </p>
      <blockquote>
        «Los lugares que vuelven son los que aún tienen algo que reclamarte.»
        <cite>— Cuaderno azul, julio 2025</cite>
      </blockquote>
    </Section>
    <Section num="02" title="La hamaca, el libro abandonado">
      <p>
        Había una hamaca tendida entre el limonero y un poste que antes no estaba. Sobre la hamaca,
        un libro abierto boca abajo, con el lomo expuesto al sol. Pensé en cerrarlo. No lo cerré.
        Tal vez quien lo dejó ahí estaba volviendo, también, de otra cosa.
      </p>
    </Section>
    <Section num="03" title="Una conversación que no tuvimos">
      <p>
        Tu nombre apareció en la conversación de los nuevos dueños — no a propósito, en una anécdota
        lateral. No corregí nada. Salí al patio y miré la higuera hasta que la luz se movió. Nada de
        eso fue importante. Y, sin embargo, aquí lo escribo.
      </p>
    </Section>
    <Section num="04" title="Lo que dejé al irme">
      <p>
        Una nota debajo de la maceta del basilico, doblada dos veces. Decía solo: «Gracias por
        cuidarla». No dejé claro si me refería a la casa o a la persona que vendría después.
      </p>
    </Section>
  </>
);

const RecadosHarina = () => (
  <>
    <p>
      La harina era el cuaderno provisional de mi abuela. Llegaba sin saberlo a las recetas porque
      antes había hecho las cuentas del día, los recados pendientes, el nombre de la prima que
      pasaba a buscar las llaves. Todo se borraba cuando empezaba a amasar.
    </p>
    <Section num="01" title="El primer recado">
      <p>
        El primer recado que recuerdo decía: «No te olvides». Solo eso. No supe nunca de qué no
        debía olvidarme. Quizá ese era exactamente el recado.
      </p>
      <blockquote>
        «Las palabras escritas en harina duran lo que dura la voluntad de no amasar.»
        <cite>— Cuaderno verde, marzo 2025</cite>
      </blockquote>
    </Section>
    <Section num="02" title="El armario azul">
      <p>
        Una tarde de invierno encontré escrito «no abrir el armario azul». Lo abrí, claro. Estaba
        lleno de cartas atadas con cinta. No las leí. Volví a cerrarlo y no he vuelto a soñar con
        él, lo cual es decir mucho.
      </p>
      <Figure
        alt="Armario azul antiguo entreabierto"
        caption="El armario azul. Tres cintas de seda. Lo que decidí no leer."
      />
    </Section>
    <Section num="03" title="Lo que se barría al final del día">
      <p>
        A las nueve de la noche venía el cepillo. La harina caía al suelo y se limpiaba con un trapo
        húmedo. Y, sin embargo, cada mañana había nuevos recados — la mesa los pedía. Esa fue mi
        primera lección sobre la memoria: que se borra para volver a escribirse.
      </p>
    </Section>
  </>
);

const AbrirPuerta = () => (
  <>
    <p>
      Hay puertas que pesan más por dentro que por fuera. Esta tarde aprendí cuál era la mía. Estaba
      en una casa prestada — cocina con baldosas blancas, una percha sin abrigos, y al fondo esa
      puerta verde que llevaba toda la semana posponiendo. Sé que suena exagerado. Suena así porque
      lo es.
    </p>
    <Section num="01" title="La cerradura que conocía">
      <p>
        La llave entró como entran las llaves cuando el mecanismo te conoce. Hubo un clic, y luego
        nada. Me quedé con la mano en el picaporte un rato más largo del que admito.
      </p>
      <blockquote>
        «Lo difícil no es decidir. Lo difícil es seguir teniendo el cuerpo en el sitio exacto donde
        decidiste.»
        <cite>— Diario, 28 abril 2026</cite>
      </blockquote>
    </Section>
    <Section num="02" title="El umbral">
      <p>
        En el umbral hay algo que no es sala ni pasillo. Es la pausa entre quien fuiste hace cinco
        minutos y quien vas a ser cuando la puerta se cierre detrás. La luz, ahí, siempre está rara
        — ni la de afuera ni la de adentro.
      </p>
    </Section>
    <Section num="03" title="Volver a entrar">
      <p>
        Entré. No pasó nada de lo que había imaginado. Casi nada nunca pasa como uno lo imagina; lo
        que sí pasa es que uno termina entrando, y eso, en general, es lo único que importaba.
      </p>
    </Section>
  </>
);

const DiarioMayo = () => (
  <>
    <p>
      Hoy es miércoles, primer miércoles de mayo, y son las seis de la mañana. La luz no llega
      todavía a la mesa donde escribo, pero ya empieza a delinear los bordes — el florero vacío, el
      cuaderno abierto, el lomo de un libro al revés. Si me acuesto temprano, esto es lo que me
      regala la madrugada: una hora que no le debo a nadie.
    </p>
    <Section num="01" title="6 de la mañana">
      <p>
        El café aún está caliente. Lo dejo enfriar a propósito porque me gusta el momento exacto en
        que ya no quema y todavía no sabe a tibio. Es un margen pequeño. Lo persigo con cuidado.
      </p>
    </Section>
    <Section num="02" title="Antes del mediodía">
      <p>
        Llamó M., como siempre. Le dije más de lo que tenía pensado decir. Eso me pasa con ella
        desde hace años: hablo por encima de mi propia voluntad, y luego me arrepiento sin motivo.
        Más tarde le escribiré para retirar nada.
      </p>
      <blockquote>
        «Hay frases que solo se pueden retirar callándose.»
        <cite>— Cuaderno gris, abril 2026</cite>
      </blockquote>
    </Section>
    <Section num="03" title="Por la noche">
      <p>
        Lluvia. La de mayo, breve, casi fingida. Luego un olor a tierra que dura más que la lluvia
        misma. Eso, también, lo persigo. Quizá esto del diario sea solo eso — perseguir lo que dura
        más que su causa.
      </p>
    </Section>
  </>
);

const CartaJunio = () => (
  <>
    <p>
      Hay correos que se escriben para no enviarlos. Este es uno. Llevaba semanas redactándolo en la
      cabeza, en distintos tonos, y cuando finalmente me senté delante del teclado salió de un
      tirón, sin pausas, como si lo hubiera memorizado por adelantado.
    </p>
    <Section num="01" title="Querido tú">
      <p>
        Empieza así porque toda carta que cuente debería empezar así. No por el adjetivo — «querido»
        admite muchas dudas— sino por el «tú», que es donde uno se compromete del todo.
      </p>
      <blockquote>
        «Escribir a alguien es prometerle, aunque sea un instante, que existe.»
        <cite>— Cuaderno blanco, junio 2025</cite>
      </blockquote>
    </Section>
    <Section num="02" title="Lo que no te dije">
      <p>
        Lo que no te dije lo escribo aquí porque ya sé que no te lo voy a decir. Que la calle de
        agosto sigue en obras. Que el café del que hablábamos cerró. Que no estoy esperando, pero
        tampoco he aprendido a no esperar.
      </p>
      <Figure
        alt="Sobre cerrado sobre escritorio antiguo"
        caption="Un sobre. Un sello viejo. La distancia entre escribir y enviar."
      />
    </Section>
    <Section num="03" title="Por qué no la mando">
      <p>
        Porque enviarla cambiaría la forma del recuerdo. Y porque escribirla ya me bastó — más de lo
        que esperaba, y menos de lo que necesitaría para mandarla.
      </p>
    </Section>
  </>
);

// ---------------------------------------------------------------------------

const BODIES: Record<string, () => ReactNode> = {
  "casa-agosto": CasaAgosto,
  "verano-otra-casa": VeranoOtraCasa,
  "recados-harina": RecadosHarina,
  "abrir-puerta": AbrirPuerta,
  "diario-mayo": DiarioMayo,
  "carta-junio": CartaJunio,
};

export function getPostBody(slug: string): ReactNode {
  const Body = BODIES[slug];
  if (!Body) {
    return (
      <p style={{ color: "var(--ink-muted)" }}>Este texto aún no tiene cuerpo. Vuelve pronto.</p>
    );
  }
  return <Body />;
}
